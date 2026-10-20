/**
 * test.js
 *
 * @Author : Mayank Sindwani
 * @Date   : 2016-09-05
 * @Description : Tests for mhtml2html.
 *
 * The MIT License(MIT)
 * Copyright(c) 2016 Mayank Sindwani
 **/

'use strict';

var parseDOM;
var mhtml2html;
var readMHTML;
var chai;
var fs;

if (typeof module !== 'undefined' && module.exports) {
    // Node.js dependencies.
    const { JSDOM } = require('jsdom');
    mhtml2html = require('../src/mhtml2html');
    parseDOM = (html) => new JSDOM(html);
    chai = require('chai');
    fs = require('fs');

    readMHTML = function(file, callback) {
        fs.readFile(`tests/templates/${file}`, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            callback(data);
        });
    }
} else {
    // Browser dependencies.
    mhtml2html = window.mhtml2html;
    chai = window.chai;

    readMHTML = function readMHTML(file, callback) {
        // Fetch from the running web server.
        fetch('/templates/' + file).then(function(response) {
            return response.blob();
        }).then(function(mhtmlBlob) {
            // Read the mhtml template as a string.
            var reader = new FileReader();
            reader.addEventListener("loadend", function() {
                callback(this.result);
            });
            reader.readAsText(mhtmlBlob);
        });
    }
}

describe('Test parsing MHTML', function () {

    it('Should parse valid MHTML', function(done) {
        readMHTML('portfolio.mhtml', (data) => {
            let doc;

            doc = mhtml2html.parse(data, { parseDOM });
            chai.expect(doc).to.be.a('object');
            chai.expect(doc).to.have.property('index', 'http://msindwan.bitbucket.org/');
            chai.expect(doc).to.have.property('media');

            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/ext/font-awesome/fonts/fontawesome-webfont.woff?v=4.2.0');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/ext/font-awesome/fonts/fontawesome-webfont.woff?v=4.2.0');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/ext/font-awesome/css/font-awesome.min.css');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/ext/bootstrap/bootstrap.min.css');
            chai.expect(doc.media).to.have.property('https://fonts.gstatic.com/s/roboto/v15/2tsd397wLxj96qwHyNIkxPesZW2xOQ-xsNqO47m55DA.woff2');
            chai.expect(doc.media).to.have.property('https://fonts.gstatic.com/s/roboto/v15/CWB0XYA8bzo0kSThX0UTuA.woff2');
            chai.expect(doc.media).to.have.property('https://fonts.googleapis.com/css?family=Roboto:400,100');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/images/html5.png');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/images/flux.png');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/images/node.png');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/images/mongodb.png');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/images/react.png');
            chai.expect(doc.media).to.have.property('http://msindwan.bitbucket.org/css/design.css');

            done();
        });
    });

    it('Should raise an exception for invalid MHTML (Missing Headers)', function(done) {
        readMHTML('missing_headers.mhtml', (data) => {
            // Address-less parts are filed under synthetic keys, so this
            // truncated file now fails at EOF instead of at the part headers.
            chai.expect(() => { mhtml2html.parse(data, { parseDOM }); }).to.throw('Unexpected EOF');
            done();
        });
    });

    it('Should raise an exception for invalid MHTML (Missing Boundary Header)', function(done) {
        readMHTML('missing_boundary_header.mhtml', (data) => {
            chai.expect(() => { mhtml2html.parse(data, { parseDOM }); }).to.throw('Missing boundary from document headers; Line 7');
            done();
        });
    });

    it('Should raise an exception for invalid MHTML (Missing Asset Boundary)', function(done) {
        readMHTML('missing_boundary.mhtml', (data) => {
            // NB: Line 10, not 9 — trim() counts the \r\n blank line.
            chai.expect(() => { mhtml2html.parse(data, { parseDOM }); }).to.throw('Expected boundary; Line 10');
            done();
        });
    });

    it('Should raise an exception for invalid MHTML (Unexpected EOF)', function(done) {
        readMHTML('unexpected_eof.mhtml', (data) => {
            chai.expect(() => { mhtml2html.parse(data, { parseDOM }); }).to.throw('Unexpected EOF');
            done();
        });
    });

});

describe('Test converting MHTML to HTML', function () {

    it('Should convert valid MHTML from string', function(done) {
        this.timeout(10000);

        readMHTML('portfolio.mhtml', (data) => {
            let doc;

            doc = mhtml2html.convert(data, { parseDOM });
            chai.expect(typeof doc).to.equal('object');
            chai.expect(doc).to.have.property('window');
            done();
        });
    });

    it('Should convert valid MHTML from parsed object', function(done) {
        this.timeout(10000);

        readMHTML('portfolio.mhtml', (data) => {
            let doc;

            doc = mhtml2html.parse(data, { parseDOM });
            doc = mhtml2html.convert(doc, { parseDOM });

            chai.expect(doc).to.have.property('window');
            done();
        });
    });

    it('Should convert valid MHTML with iframes disabled', function(done) {
        this.timeout(10000);

        readMHTML('iframes.mhtml', (data) => {
            const doc = mhtml2html.convert(data, { parseDOM, convertIframes: false });
            const iframe = doc.window.document.querySelector('iframe.result');
            chai.expect(iframe.src.startsWith('cid')).to.be.true;
            done();
        });
    });

    it('Should convert valid MHTML with iframes enabled', function(done) {
        this.timeout(10000);

        readMHTML('iframes.mhtml', (data) => {
            const doc = mhtml2html.convert(data, { parseDOM, convertIframes: true });
            const iframe = doc.window.document.querySelector('iframe.result');
            chai.expect(iframe.src.startsWith('data:text/html;charset=utf-8,')).to.be.true;
            done();
        });
    });

    it('Should raise an exception for invalid MHTML string (Missing Boundary Header)', function(done) {
        readMHTML('missing_boundary_header.mhtml', (data) => {
            chai.expect(() => { mhtml2html.convert(data, { parseDOM }); }).to.throw('Missing boundary from document headers; Line 7');
            done();
        });
    });

    it('Should raise an exception for invalid MHTML object', function(done) {
        chai.expect(() => { mhtml2html.convert({ }, { parseDOM }); }).to.throw('MHTML error: invalid frames');
        done();
    });

    it('Should decode base64 text/html parts', function(done) {
        // <h1>Hello</h1> as base64; previously left as base64 text.
        const data = 'MIME-Version: 1.0\n' +
            'Content-Type: multipart/related; boundary="b1"\n' +
            '\n' +
            '--b1\n' +
            'Content-Type: text/html\n' +
            'Content-Transfer-Encoding: base64\n' +
            'Content-Location: http://example.com/\n' +
            '\n' +
            'PGgxPkhlbGxvPC9oMT4=\n' +
            '--b1--\n';
        const doc = mhtml2html.parse(data, { parseDOM });
        chai.expect(doc.index).to.equal('http://example.com/');
        chai.expect(doc.media['http://example.com/'].data).to.equal('<h1>Hello</h1>');
        done();
    });

    it('Should skip preamble before the first boundary', function(done) {
        const data = 'MIME-Version: 1.0\n' +
            'Content-Type: multipart/related; boundary="b2"\n' +
            '\n' +
            'This is a multipart message in MIME format.\n' +
            '\n' +
            '--b2\n' +
            'Content-Type: text/html\n' +
            'Content-Transfer-Encoding: quoted-printable\n' +
            'Content-Location: http://example.com/\n' +
            '\n' +
            'Hello=20World\n' +
            '--b2--\n';
        const doc = mhtml2html.parse(data, { parseDOM });
        chai.expect(doc.index).to.equal('http://example.com/');
        chai.expect(doc.media['http://example.com/'].data).to.equal('Hello World\n');
        done();
    });

    it('Should descend into nested multipart and pick the first text/html', function(done) {
        const data = 'MIME-Version: 1.0\n' +
            'Content-Type: multipart/related; boundary="outer"\n' +
            '\n' +
            '--outer\n' +
            'Content-Type: image/gif\n' +
            'Content-Transfer-Encoding: base64\n' +
            'Content-Location: http://example.com/a.gif\n' +
            '\n' +
            'R0lGODlhAQABAIAAAP8AAAAA\n' +
            '\n' +
            '--outer\n' +
            'Content-Type: multipart/alternative;\n' +
            '\tboundary="inner"\n' +
            '\n' +
            '--inner\n' +
            'Content-Type: text/html\n' +
            'Content-Transfer-Encoding: quoted-printable\n' +
            'Content-Location: http://example.com/\n' +
            '\n' +
            'Nested=20OK\n' +
            '--inner--\n' +
            '\n' +
            '--outer\n' +
            'Content-Type: text/css\n' +
            'Content-Transfer-Encoding: quoted-printable\n' +
            'Content-Location: http://example.com/a.css\n' +
            '\n' +
            'a { color: red; }\n' +
            '--outer--\n';
        const doc = mhtml2html.parse(data, { parseDOM });
        chai.expect(doc.index).to.equal('http://example.com/');
        chai.expect(doc.media['http://example.com/'].data).to.equal('Nested OK\n');
        // Binary payloads stay base64 for data-URI consumers.
        chai.expect(doc.media['http://example.com/a.gif'].data).to.equal('R0lGODlhAQABAIAAAP8AAAAA');
        chai.expect(doc.media).to.have.property('http://example.com/a.css');
        done();
    });

    it('Should resolve relative img src against absolute Content-Location', function(done) {
        const data = 'MIME-Version: 1.0\n' +
            'Content-Type: multipart/related; boundary="b5"\n' +
            '\n' +
            '--b5\n' +
            'Content-Type: text/html\n' +
            'Content-Transfer-Encoding: quoted-printable\n' +
            'Content-Location: file:///C:/doc/page.htm\n' +
            '\n' +
            '<html><body><img src="files/a.png"></body></html>\n' +
            '--b5\n' +
            'Content-Type: image/png\n' +
            'Content-Transfer-Encoding: base64\n' +
            'Content-Location: file:///C:/doc/files/a.png\n' +
            '\n' +
            'iVBORw0KGgo=\n' +
            '--b5--\n';
        const doc = mhtml2html.convert(data, { parseDOM });
        const img = doc.window.document.querySelector('img');
        chai.expect(img.getAttribute('src').startsWith('data:image/png;base64,')).to.be.true;
        done();
    });

    it('Should apply octet-stream stylesheets and spaced url() references', function(done) {
        const data = 'MIME-Version: 1.0\n' +
            'Content-Type: multipart/related; boundary="b6"\n' +
            '\n' +
            '--b6\n' +
            'Content-Type: text/html\n' +
            'Content-Transfer-Encoding: quoted-printable\n' +
            'Content-Location: http://example.com/page\n' +
            '\n' +
            '<html><head><link rel="stylesheet" href="style.css">' +
            '<style>@import url( theme.css );</style></head><body>Hi</body></html>\n' +
            '--b6\n' +
            'Content-Type: application/octet-stream\n' +
            'Content-Transfer-Encoding: base64\n' +
            'Content-Location: http://example.com/style.css\n' +
            '\n' +
            'Ym9keSB7IGNvbG9yOiByZWQ7IH0=\n' +
            '--b6\n' +
            'Content-Type: application/octet-stream\n' +
            'Content-Transfer-Encoding: base64\n' +
            'Content-Location: http://example.com/theme.css\n' +
            '\n' +
            'cCB7IG1hcmdpbjogMDsgfQ==\n' +
            '--b6--\n';
        const parsed = mhtml2html.parse(data, { parseDOM });
        chai.expect(parsed.media['http://example.com/style.css'].type).to.equal('text/css');
        const doc = mhtml2html.convert(data, { parseDOM });
        chai.expect(doc.window.document.querySelectorAll('link').length).to.equal(0);
        const css = [...doc.window.document.querySelectorAll('style')]
            .map(s => s.textContent).join('\n');
        chai.expect(css).to.contain('color: red');
        chai.expect(css).to.contain('data:text/css;base64,');
        done();
    });

    it('Should file address-less parts (email style) under synthetic keys', function(done) {
        const data = 'MIME-Version: 1.0\n' +
            'Content-Type: multipart/alternative; boundary="b4"\n' +
            '\n' +
            '--b4\n' +
            'Content-Type: text/plain;\n' +
            '\tcharset="UTF-8"\n' +
            'Content-Transfer-Encoding: 8bit\n' +
            '\n' +
            'plain text here\n' +
            '\n' +
            '--b4\n' +
            'Content-Type: text/html;\n' +
            '\tcharset="UTF-8"\n' +
            'Content-Transfer-Encoding: quoted-printable\n' +
            '\n' +
            '<html><body>Hi</body></html>\n' +
            '--b4--\n';
        const doc = mhtml2html.parse(data, { parseDOM });
        chai.expect(doc.index).to.match(/^__mhtml_part_/);
        chai.expect(doc.media[doc.index].data).to.contain('Hi');
        done();
    });

});
