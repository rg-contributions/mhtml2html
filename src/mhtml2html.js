/**
 * mhtml2html
 *
 * @Author : Mayank Sindwani
 * @Date   : 2016-09-05
 * @Description : Converts mhtml to html.
 *
 * Licensed under the MIT License
 * Copyright(c) 2016 Mayank Sindwani
 **/

const QuotedPrintable = require('quoted-printable');
const Base64 = require('base-64');

// Asserts a condition.
function assert(condition, error) {
    if (!condition) {
        throw new Error(error);
    }
    return true;
}

// Default DOM parser (browser only).
function defaultDOMParser(asset) {
    assert(typeof DOMParser !== 'undefined', 'No DOM parser available');
    return {
        window: {
            document: new DOMParser().parseFromString(asset, "text/html")
        }
    };
}

// Returns an absolute url from base and relative paths.
function absoluteURL(base, relative) {
    if (relative.indexOf('http://') === 0 || relative.indexOf('https://') === 0) {
        return relative;
    }

    const stack = base.split('/');
    const parts = relative.split('/');

    stack.pop();

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] == ".") {
            continue;
        } else if (parts[i] == "..") {
            stack.pop();
        } else {
            stack.push(parts[i]);
        }
    }

    return stack.join('/');
}

// Resolves an asset reference to a media key: exact match first, then
// relative to the index document (saved files often pair relative
// src/href with absolute Content-Locations). References carrying a URI
// scheme (cid:, data:, absolute URLs) are only looked up exactly.
function resolveMediaKey(media, base, ref) {
    if (typeof ref !== 'string') {
        return undefined;
    }
    const key = ref.trim();
    if (typeof media[key] !== 'undefined') {
        return key;
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(key)) {
        return undefined;
    }
    const abs = absoluteURL(base, key);
    return (typeof media[abs] !== 'undefined') ? abs : undefined;
}

// Converts a string to an ArrayBuffer.
function stringToArrayBuffer(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// Replace asset references with the corresponding data.
function replaceReferences(media, base, asset) {
    const CSS_URL_RULE = 'url(';
    let reference, i;

    for (i = 0; (i = asset.indexOf(CSS_URL_RULE, i)) > 0; i += reference.length) {
        i += CSS_URL_RULE.length;
        reference = asset.substring(i, asset.indexOf(')', i));

        // Get the absolute path of the referenced asset.
        const path = absoluteURL(base, reference.replace(/(\"|\')/g,'').trim());
        if (media[path] != null) {
            if (media[path].type === 'text/css') {
                media[path].data = replaceReferences(media, base, media[path].data);
            }
            // Replace the reference with an encoded version of the resource.
            try {
                const embeddedAsset = `'data:${media[path].type};base64,${(
                    media[path].encoding === 'base64' ?
                        media[path].data :
                        Base64.encode(media[path].data)
                )}'`;
                asset = `${asset.substring(0, i)}${embeddedAsset}${asset.substring(i + reference.length)}`;
            } catch(e) {
                console.warn(e);
            }
        }
    }
    return asset;
}

// Converts the provided asset to a data URI based on the encoding.
function convertAssetToDataURI(asset) {
    switch(asset.encoding) {
        case 'quoted-printable':
            return `data:${asset.type};utf8,${escape(QuotedPrintable.decode(asset.data))}`;
        case 'base64':
            return `data:${asset.type};base64,${asset.data}`;
        default:
            return `data:${asset.type};base64,${Base64.encode(asset.data)}`;
    }
}

// Main module.
const mhtml2html = {

    /**
     * Parse
     *
     * Description: Returns an object representing the mhtml and its resources.
     * @param {mhtml_p} // The mhtml string.
     * @param {options.htmlOnly} // A flag to determine which parsed object to return.
     * @param {options.parseDOM} // The callback to parse an HTML string.
     * @returns an html document without resources if htmlOnly === true; an MHTML parsed object otherwise.
     */
    parse: (mhtml_p, { htmlOnly = false, parseDOM  = defaultDOMParser } = {}) => {
        const MHTML_FSM = {
            MHTML_HEADERS : 0,
            MTHML_CONTENT : 1,
            MHTML_DATA    : 2,
            MHTML_END     : 3
        };

        let mhtml;
        let asset, headers, content, media, frames;  // Record-keeping.
        let location, encoding, type, id;            // Content properties.
        let state, key, next, index, i, l;           // States.
        let boundary;                                // Boundaries.
        let boundaryStack = [];                      // Enclosing boundaries for nested multipart.
        let autoId = 0;                              // Synthetic keys for address-less parts.

        mhtml = mhtml_p;
        headers = { };
        content = { };
        media   = { };
        frames  = { };

        // Initial state and index.
        state = MHTML_FSM.MHTML_HEADERS;
        i = l = 0;

        // Discards characters until a non-whitespace character is encountered.
        function trim() {
            while (assert(i < mhtml.length - 1, 'Unexpected EOF') && /\s/.test(mhtml[i])) {
                if (mhtml[++i] == '\n') { l++; }
            }
        }

        // Returns the next line from the index.
        function getLine(encoding) {
            const j = i;

            // Wait until a newline character is encountered or when we exceed the str length.
            while (mhtml[i] !== '\n' && assert(i++ < mhtml.length - 1, 'Unexpected EOF'));
            i++; l++;

            const line = mhtml.substring(j, i);

            // Return the (decoded) line.
            if (encoding === 'quoted-printable') {
                return QuotedPrintable.decode(line);
            }
            if (encoding === 'base64') {
                return line.trim();
            }
            return line;
        }

        // Splits headers from the first instance of ':'.
        function splitHeaders(line, obj) {
            const m = line.indexOf(':');
            if (m > -1) {
                key = line.substring(0, m).trim();
                obj[key] = line.substring(m + 1, line.length).trim();
            } else {
                assert(typeof key !== 'undefined', `Missing MHTML headers; Line ${l}`);
                obj[key] += line.trim();
            }
        }

        // Consumes lines through the current boundary delimiter. Preamble
        // content (RFC 2046 5.1.1, e.g. the "multipart message" notice or a
        // localized IE notice) carries no header field and is ignored; a
        // header-like line before any boundary means the delimiter is
        // genuinely missing.
        function expectBoundary() {
            trim();
            for (;;) {
                const line = getLine();
                if (line.trim().includes(boundary)) {
                    return line;
                }
                if (/^[A-Za-z0-9-]+:/.test(line.trim())) {
                    assert(false, `Expected boundary; Line ${l}`);
                }
            }
        }

        while (state != MHTML_FSM.MHTML_END) {
            switch(state) {
                // Fetch document headers including the boundary to use.
                case MHTML_FSM.MHTML_HEADERS: {
                    next = getLine();
                    
                    // Use a new line or null character to determine when we should
                    // stop processing headers.
                    if (next != 0 && next != '\n') {
                        splitHeaders(next, headers);
                    } else {
                        assert(typeof headers['Content-Type'] !== 'undefined', `Missing document content type; Line ${l}`);
const matches = headers['Content-Type'].match(/boundary=([^;]+)/m);

                        // Ensure the extracted boundary exists.
                        assert(matches != null, `Missing boundary from document headers; Line ${l}`);
                        boundary = matches[1].replace(/\"/g,'');

                        // Skip any preamble (the "multipart message" notice,
                        // a localized IE notice, ...) until the first delimiter.
                        next = expectBoundary();
content = { };
state = MHTML_FSM.MTHML_CONTENT;
                    }
                    break;
                }

                // Parse and store content headers.
                case MHTML_FSM.MTHML_CONTENT: {
                    next = getLine();

                    // Use a new line or null character to determine when we should
                    // stop processing headers.
                    if (next != 0 && next != '\n') {
                        splitHeaders(next, content);
                    } else {
                        type = content['Content-Type'];

                        // A nested multipart container carries no payload of its
                        // own: descend into its inner boundary and parse the
                        // enclosed parts instead.
                        if (typeof type !== 'undefined' &&
                            type.split(';')[0].trim().toLowerCase().startsWith('multipart/')) {
                            const nested = content['Content-Type'].match(/boundary=([^;]+)/m);
                            assert(nested != null, `Missing boundary from part headers; Line ${l}`);
                            boundaryStack.push(boundary);
                            boundary = nested[1].replace(/\"/g,'');
                            expectBoundary();
                            content = { };
                            break;
                        }

                        encoding = content['Content-Transfer-Encoding'];
                        id       = content['Content-ID'];
                        location = content['Content-Location'];

                        // Ensure the extracted information exists.
                        assert(typeof encoding !== 'undefined', `Content-Transfer-Encoding not provided;  Line ${l}`);
                        assert(typeof type     !== 'undefined', `Content-Type not provided; Line ${l}`);

                        // Parts without any address (common in email-saved
                        // files) still carry content: file them under a
                        // synthetic key so they stay retrievable.
                        if (typeof id === 'undefined' && typeof location === 'undefined') {
                            location = `__mhtml_part_${autoId++}__`;
                        }
                        if (typeof location === 'undefined') {
                            location = id; // ID-only part: address it by its ID.
                        }

                        // IE/Outlook save stylesheets as application/octet-stream;
                        // restore the real type from the location's file extension
                        // so LINK/STYLE embedding serves them with the CSS MIME.
                        if (type.split(';')[0].trim().toLowerCase() === 'application/octet-stream') {
                            const ext = location.split('?')[0].split('.').pop().toLowerCase();
                            if (ext === 'css') {
                                type = 'text/css';
                            }
                        }

                        // The index is the first text/html part, wherever it
                        // appears (earlier parts may be images or containers).
                        if (typeof index === 'undefined' &&
                            type.split(';')[0].trim().toLowerCase() === 'text/html') {
                            index = location;
                        }

                        asset = {
                            encoding : encoding,
                            type : type,
                            data : '',
                            id : id
                        };

                        // Keep track of frames by ID.
                        if (typeof id !== 'undefined') {
                            frames[id] = asset;
                        }

                        // Keep track of resources by location.
                        if (typeof location !== 'undefined' && typeof media[location] === 'undefined') {
                            media[location] = asset;
                        }

                        trim();
                        content = { };
                        state = MHTML_FSM.MHTML_DATA;
                    }
                    break;
                }

                // Map data to content.
                case MHTML_FSM.MHTML_DATA: {
                    next = getLine(encoding);

                    // Build the decoded string.
                    while (!next.includes(boundary)) {
                        asset.data += next;
                        next = getLine(encoding);
                    }

                    // Base64-encoded text payloads are still base64 at this
                    // point (getLine only trims them): decode to the transfer
                    // payload before the UTF-8/charset steps below. Binary
                    // assets stay base64 (data-URI consumers expect it).
                    if (encoding === 'base64' &&
                        type.split(';')[0].trim().toLowerCase().startsWith('text/')) {
                        try {
                            asset.data = Base64.decode(asset.data.replace(/\s+/g, ''));
                        } catch (e) {
                            // Keep the raw payload; the fallback below handles it.
                        }
                    }

                    let decodedData = asset.data; // Store original data for fallback
                    try {
                        // Try decoding as UTF-8 first (implicit in escape/decodeURIComponent)
                        asset.data = decodeURIComponent(escape(asset.data));
                    } catch (e) {
                        console.warn(
                            `Initial decoding failed for asset (Type: ${asset.type}, ID: ${asset.id}, Location: ${location}). ` +
                            `Attempting fallback. Error: ${e.message}`
                        );
                        let charset = null;        // Declare variables in the outer catch scope
                        let charsetSource = null;
                        try {
                            // 1. Try extracting charset from the part's Content-Type header
                            const partContentType = asset.type || '';
                            const partCharsetMatch = partContentType.match(/charset=([^;]+)/i);
                            if (partCharsetMatch) {
                            charset = partCharsetMatch[1].trim().replace(/"/g, '');
                            charsetSource = 'part header';
                            }

                            // 2. If not found in part, try extracting from the main MHTML document's Content-Type header
                            if (!charset && headers['Content-Type']) {
                                const mainContentType = headers['Content-Type'] || '';
                                const mainCharsetMatch = mainContentType.match(/charset=([^;]+)/i);
                                if (mainCharsetMatch) {
                                    charset = mainCharsetMatch[1].trim();
                                    charsetSource = 'main header';
                                }
                            }

                            // 3. If still no charset AND this is the main HTML document, try finding a meta tag
                            if (!charset && location === index) {
                                console.log('No charset in headers, attempting to find meta tag in main HTML.');
                                // Regex for <meta charset="...">
                                const metaCharsetRegex = /<meta\s+.*?charset\s*=\s*["']?([^"'>\s]+)/i;
                                // Regex for <meta http-equiv="Content-Type" content="...; charset=...">
                                const metaHttpEquivRegex = new RegExp(
                                    '<meta\\s+http-equiv\\s*=\\s*["\']?Content-Type["\']?\\s+' +
                                    'content\\s*=\\s*["\']?[^"\'>]+;\\s*charset=([^"\'>\\s]+)', 'i'
                                );

                                let metaMatch = decodedData.match(metaCharsetRegex) || decodedData.match(metaHttpEquivRegex);

                                if (metaMatch && metaMatch[1]) {
                                    charset = metaMatch[1].trim();
                                    charsetSource = 'meta tag';
                                    console.log(`Found charset '${charset}' in meta tag.`);
                                } else {
                                    console.log('No charset meta tag found in main HTML.');
                                }
                            }

                            // 4. Attempt decoding if a charset was found (from any source) and TextDecoder is available
                            if (charset && typeof TextDecoder !== 'undefined') {
                                console.log(`Attempting decoding with charset '${charset}' from ${charsetSource}.`);
                                const decoder = new TextDecoder(charset, { fatal: true }); // fatal: true throws on error
                                const buffer = stringToArrayBuffer(decodedData); // Use original data
                                asset.data = decoder.decode(buffer);
                                console.log(`Successfully decoded with charset: ${charset}`);
                            } else if (charset) {
                                // Charset found, but TextDecoder unavailable
                                console.warn(
                                    `TextDecoder API not available, cannot decode with charset '${charset}' from ${charsetSource}.`
                                );
                                asset.data = decodedData; // Revert to original data
                            } else {
                                // No charset found from any source (part header, main header, or meta tag)
                                console.warn(
                                    'No charset specified in headers or meta tag, cannot apply fallback decoding.'
                                );
                                asset.data = decodedData; // Revert to original data
                            }
                        } catch (fallbackError) {
                            // Now charset and charsetSource are accessible here
                            console.error(
                                `Fallback decoding failed for asset (Type: ${asset.type}, ID: ${asset.id}, Loc: ${location}). ` +
                                `Charset: ${charset} (from ${charsetSource}). Error: ${fallbackError.message}`
                            );
                            asset.data = decodedData; // Revert to original data on fallback failure
                        }
                    }

                    // Ignore assets if 'htmlOnly' is set.
                    if (htmlOnly === true && typeof index !== 'undefined') {
                        return parseDOM(asset.data);
                    }

                    // A closing delimiter for a nested boundary resumes the
                    // enclosing multipart (its own delimiter follows next),
                    // or ends the document if nothing follows.
                    if (next.includes(boundary + '--') && boundaryStack.length) {
                        boundary = boundaryStack.pop();
                        content = { };
                        expectBoundary();
                        state = (i >= mhtml.length - 1 ? MHTML_FSM.MHTML_END : MHTML_FSM.MTHML_CONTENT);
                        break;
                    }

                    // Set the finishing state if there are no more characters.
                    state = (i >= mhtml.length - 1 ? MHTML_FSM.MHTML_END : MHTML_FSM.MTHML_CONTENT);
                    break;
                }
            }
        }

        assert(typeof index !== 'undefined', `Index not found; Line ${l}`);

        return {
            frames: frames,
            media: media,
            index: index
        };
    },

    /**
     * Convert
     *
     * Description: Accepts an mhtml string or parsed object and returns the converted html.
     * @param {mhtml} // The mhtml string or object.
     * @param {options.convertIframes} // Whether or not to include iframes in the converted response (defaults to false).
     * @param {options.parseDOM} // The callback to parse an HTML string.
     * @returns an html document element.
     */
    convert: (mhtml, { convertIframes = false, parseDOM = defaultDOMParser } = {}) => {
        let index, media, frames;  // Record-keeping.
        let style, base, img;      // DOM objects.
        let href, src;             // References.
        let cssKey, imgKey;        // Resolved media keys.

        if (typeof mhtml === "string") {
            mhtml = mhtml2html.parse(mhtml);
        } else {
            assert(typeof mhtml === "object", 'Expected argument of type string or object');
        }

        frames = mhtml.frames;
        media  = mhtml.media;
        index  = mhtml.index;

        assert(typeof frames === "object", 'MHTML error: invalid frames');
        assert(typeof media  === "object", 'MHTML error: invalid media' );
        assert(typeof index  === "string", 'MHTML error: invalid index' );
        assert(media[index] && media[index].type.startsWith("text/html"), 'MHTML error: invalid index');

const dom = parseDOM(media[index].data);
const documentElem = dom.window.document;

// Force UTF-8 charset in meta tag
const metaCharset = documentElem.querySelector('meta[charset]');
if (metaCharset) {
    metaCharset.setAttribute('charset', 'UTF-8');
} else {
    const head = documentElem.querySelector('head');
    if (head) {
        const meta = documentElem.createElement('meta');
        meta.setAttribute('charset', 'UTF-8');
        head.insertBefore(meta, head.firstChild);
    }
}

const nodes = [ documentElem ];

// Merge resources into the document.
while (nodes.length) {
    const childNode = nodes.shift();

    // Resolve each node.
    childNode.childNodes.forEach(function(child) {
        if (child.getAttribute) {
            href = child.getAttribute('href');
            src  = child.getAttribute('src');
        }
        if (child.removeAttribute) {
            child.removeAttribute('integrity');
        }
        switch(child.tagName) {
            case 'HEAD':
                // Link targets should be directed to the outer frame.
                base = documentElem.createElement("base");
                base.setAttribute("target", "_parent");
                child.insertBefore(base, child.firstChild);
                break;

            case 'LINK':
                cssKey = resolveMediaKey(media, index, href);
                if (typeof cssKey !== 'undefined' && media[cssKey].type === 'text/css') {
                    // Embed the css into the document.
                    style = documentElem.createElement('style');
                    style.type = 'text/css';
                    media[cssKey].data = replaceReferences(media, cssKey, media[cssKey].data);
                    style.appendChild(documentElem.createTextNode(media[cssKey].data));
                    childNode.replaceChild(style, child);
                }
                break;

            case 'STYLE':
                style = documentElem.createElement('style');
                style.type = 'text/css';
                style.appendChild(documentElem.createTextNode(replaceReferences(media, index, child.innerHTML)));
                childNode.replaceChild(style, child);
                break;

            case 'IMG':
                img = null;
                imgKey = resolveMediaKey(media, index, src);
                if (typeof imgKey !== 'undefined' && media[imgKey].type.includes('image')) {
                    // Embed the image into the document.
                    try {
                        img = convertAssetToDataURI(media[imgKey]);
                    } catch(e) {
                        console.warn(e);
                    }
                    if (img !== null) {
                        child.setAttribute('src', img);
                    }
                }
                child.style.cssText = replaceReferences(media, index, child.style.cssText);
                break;

            case 'IFRAME':
                if (convertIframes === true && src) {
                    const id = `<${src.split('cid:')[1]}>`;
                    const frame = frames[id];

                    if (frame && frame.type === 'text/html') {
                        const iframe = mhtml2html.convert({
                            media: Object.assign({}, media, { [id] : frame }),
                            frames: frames,
                            index: id,
                        }, { convertIframes, parseDOM });
                        child.src = `data:text/html;charset=utf-8,${encodeURIComponent(
                            iframe.window.document.documentElement.outerHTML
                        )}`;
                    }
                }
                break;

            default:
                if (child.style) {
                    child.style.cssText = replaceReferences(media, index, child.style.cssText);
                }
                break;
        }
        nodes.push(child);
    });
}
return dom;
    }
};

module.exports = mhtml2html;
