!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.mhtml2html=t()}}(function(){var t;return function t(e,n,r){function o(i,a){if(!n[i]){if(!e[i]){var h="function"==typeof require&&require;if(!a&&h)return h(i,!0);if(s)return s(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var c=n[i]={exports:{}};e[i][0].call(c.exports,function(t){var n=e[i][1][t];return o(n||t)},c,c.exports,t,e,n,r)}return n[i].exports}for(var s="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(e,n,r){(function(e){!function(o){function s(t){throw new RangeError(H[t])}function i(t,e){for(var n=t.length,r=[];n--;)r[n]=e(t[n]);return r}function a(t,e){var n=t.split("@"),r="";return n.length>1&&(r=n[0]+"@",t=n[1]),t=t.replace(F,"."),r+i(t.split("."),e).join(".")}function h(t){for(var e,n,r=[],o=0,s=t.length;o<s;)e=t.charCodeAt(o++),e>=55296&&e<=56319&&o<s?(n=t.charCodeAt(o++),56320==(64512&n)?r.push(((1023&e)<<10)+(1023&n)+65536):(r.push(e),o--)):r.push(e);return r}function u(t){return i(t,function(t){var e="";return t>65535&&(t-=65536,e+=S(t>>>10&1023|55296),t=56320|1023&t),e+=S(t)}).join("")}function c(t){return t-48<10?t-22:t-65<26?t-65:t-97<26?t-97:O}function f(t,e){return t+22+75*(t<26)-((0!=e)<<5)}function l(t,e,n){var r=0;for(t=n?D(t/M):t>>1,t+=D(t/e);t>U*A>>1;r+=O)t=D(t/U);return D(r+(U+1)*t/(t+T))}function p(t){var e,n,r,o,i,a,h,f,p,d,v=[],m=t.length,y=0,g=q,b=E;for(n=t.lastIndexOf(I),n<0&&(n=0),r=0;r<n;++r)t.charCodeAt(r)>=128&&s("not-basic"),v.push(t.charCodeAt(r));for(o=n>0?n+1:0;o<m;){for(i=y,a=1,h=O;o>=m&&s("invalid-input"),f=c(t.charCodeAt(o++)),(f>=O||f>D((j-y)/a))&&s("overflow"),y+=f*a,p=h<=b?C:h>=b+A?A:h-b,!(f<p);h+=O)d=O-p,a>D(j/d)&&s("overflow"),a*=d;e=v.length+1,b=l(y-i,e,0==i),D(y/e)>j-g&&s("overflow"),g+=D(y/e),y%=e,v.splice(y++,0,g)}return u(v)}function d(t){var e,n,r,o,i,a,u,c,p,d,v,m,y,g,b,x=[];for(t=h(t),m=t.length,e=q,n=0,i=E,a=0;a<m;++a)(v=t[a])<128&&x.push(S(v));for(r=o=x.length,o&&x.push(I);r<m;){for(u=j,a=0;a<m;++a)(v=t[a])>=e&&v<u&&(u=v);for(y=r+1,u-e>D((j-n)/y)&&s("overflow"),n+=(u-e)*y,e=u,a=0;a<m;++a)if(v=t[a],v<e&&++n>j&&s("overflow"),v==e){for(c=n,p=O;d=p<=i?C:p>=i+A?A:p-i,!(c<d);p+=O)b=c-d,g=O-d,x.push(S(f(d+b%g,0))),c=D(b/g);x.push(S(f(c,0))),i=l(n,y,r==o),n=0,++r}++n,++e}return x.join("")}function v(t){return a(t,function(t){return L.test(t)?p(t.slice(4).toLowerCase()):t})}function m(t){return a(t,function(t){return N.test(t)?"xn--"+d(t):t})}var y="object"==typeof r&&r&&!r.nodeType&&r,g="object"==typeof n&&n&&!n.nodeType&&n,b="object"==typeof e&&e;b.global!==b&&b.window!==b&&b.self!==b||(o=b);var x,w,j=2147483647,O=36,C=1,A=26,T=38,M=700,E=72,q=128,I="-",L=/^xn--/,N=/[^\x20-\x7E]/,F=/[\x2E\u3002\uFF0E\uFF61]/g,H={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},U=O-C,D=Math.floor,S=String.fromCharCode;if(x={version:"1.4.1",ucs2:{decode:h,encode:u},decode:p,encode:d,toASCII:m,toUnicode:v},"function"==typeof t&&"object"==typeof t.amd&&t.amd)t("punycode",function(){return x});else if(y&&g)if(n.exports==y)g.exports=x;else for(w in x)x.hasOwnProperty(w)&&(y[w]=x[w]);else o.punycode=x}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(t,e,n){"use strict";function r(t,e){return Object.prototype.hasOwnProperty.call(t,e)}e.exports=function(t,e,n,s){e=e||"&",n=n||"=";var i={};if("string"!=typeof t||0===t.length)return i;var a=/\+/g;t=t.split(e);var h=1e3;s&&"number"==typeof s.maxKeys&&(h=s.maxKeys);var u=t.length;h>0&&u>h&&(u=h);for(var c=0;c<u;++c){var f,l,p,d,v=t[c].replace(a,"%20"),m=v.indexOf(n);m>=0?(f=v.substr(0,m),l=v.substr(m+1)):(f=v,l=""),p=decodeURIComponent(f),d=decodeURIComponent(l),r(i,p)?o(i[p])?i[p].push(d):i[p]=[i[p],d]:i[p]=d}return i};var o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},{}],3:[function(t,e,n){"use strict";function r(t,e){if(t.map)return t.map(e);for(var n=[],r=0;r<t.length;r++)n.push(e(t[r],r));return n}var o=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};e.exports=function(t,e,n,a){return e=e||"&",n=n||"=",null===t&&(t=void 0),"object"==typeof t?r(i(t),function(i){var a=encodeURIComponent(o(i))+n;return s(t[i])?r(t[i],function(t){return a+encodeURIComponent(o(t))}).join(e):a+encodeURIComponent(o(t[i]))}).join(e):a?encodeURIComponent(o(a))+n+encodeURIComponent(o(t)):""};var s=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},i=Object.keys||function(t){var e=[];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.push(n);return e}},{}],4:[function(t,e,n){"use strict";n.decode=n.parse=t("./decode"),n.encode=n.stringify=t("./encode")},{"./decode":2,"./encode":3}],5:[function(e,n,r){(function(e){!function(o){var s="object"==typeof r&&r,i="object"==typeof n&&n&&n.exports==s&&n,a="object"==typeof e&&e;a.global!==a&&a.window!==a||(o=a);var h=String.fromCharCode,u=function(t){return t.replace(/[\t\x20]$/gm,"").replace(/=(?:\r\n?|\n|$)/g,"").replace(/=([a-fA-F0-9]{2})/g,function(t,e){var n=parseInt(e,16);return h(n)})},c=function(t){return t.replace(/\x20$/,"=20").replace(/\t$/,"=09")},f=/[\0-\x08\n-\x1F=\x7F-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,l=function(t){for(var e=t.replace(f,function(t){if(t>"ÿ")throw RangeError("`quotedPrintable.encode()` expects extended ASCII input only. Don’t forget to encode the input first using a character encoding like UTF-8.");return"="+("0"+t.charCodeAt(0).toString(16).toUpperCase()).slice(-2)}),n=e.split(/\r\n?|\n/g),r=-1,o=n.length,s=[];++r<o;)for(var i=n[r],a=75,h=0,u=i.length;h<u;){var l=e.slice(h,h+a);/=$/.test(l)?(l=l.slice(0,a-1),h+=a-1):/=[A-F0-9]$/.test(l)?(l=l.slice(0,a-2),h+=a-2):h+=a,s.push(l)}var p=l.length;return/[\t\x20]$/.test(l)&&(s.pop(),p+2<=a+1?s.push(c(l)):s.push(l.slice(0,p-1),c(l.slice(p-1,p)))),s.join("=\r\n")},p={encode:l,decode:u,version:"1.0.1"};if("function"==typeof t&&"object"==typeof t.amd&&t.amd)t(function(){return p});else if(s&&!s.nodeType)if(i)i.exports=p;else for(var d in p)p.hasOwnProperty(d)&&(s[d]=p[d]);else o.quotedPrintable=p}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],6:[function(t,e,n){"use strict";function r(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}function o(t,e,n){if(t&&u.isObject(t)&&t instanceof r)return t;var o=new r;return o.parse(t,e,n),o}function s(t){return u.isString(t)&&(t=o(t)),t instanceof r?t.format():r.prototype.format.call(t)}function i(t,e){return o(t,!1,!0).resolve(e)}function a(t,e){return t?o(t,!1,!0).resolveObject(e):e}var h=t("punycode"),u=t("./util");n.parse=o,n.resolve=i,n.resolveObject=a,n.format=s,n.Url=r;var c=/^([a-z0-9.+-]+:)/i,f=/:[0-9]*$/,l=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,p=["<",">",'"',"`"," ","\r","\n","\t"],d=["{","}","|","\\","^","`"].concat(p),v=["'"].concat(d),m=["%","/","?",";","#"].concat(v),y=["/","?","#"],g=/^[+a-z0-9A-Z_-]{0,63}$/,b=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,x={javascript:!0,"javascript:":!0},w={javascript:!0,"javascript:":!0},j={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},O=t("querystring");r.prototype.parse=function(t,e,n){if(!u.isString(t))throw new TypeError("Parameter 'url' must be a string, not "+typeof t);var r=t.indexOf("?"),o=-1!==r&&r<t.indexOf("#")?"?":"#",s=t.split(o),i=/\\/g;s[0]=s[0].replace(i,"/"),t=s.join(o);var a=t;if(a=a.trim(),!n&&1===t.split("#").length){var f=l.exec(a);if(f)return this.path=a,this.href=a,this.pathname=f[1],f[2]?(this.search=f[2],this.query=e?O.parse(this.search.substr(1)):this.search.substr(1)):e&&(this.search="",this.query={}),this}var p=c.exec(a);if(p){p=p[0];var d=p.toLowerCase();this.protocol=d,a=a.substr(p.length)}if(n||p||a.match(/^\/\/[^@\/]+@[^@\/]+/)){var C="//"===a.substr(0,2);!C||p&&w[p]||(a=a.substr(2),this.slashes=!0)}if(!w[p]&&(C||p&&!j[p])){for(var A=-1,T=0;T<y.length;T++){var M=a.indexOf(y[T]);-1!==M&&(-1===A||M<A)&&(A=M)}var E,q;q=-1===A?a.lastIndexOf("@"):a.lastIndexOf("@",A),-1!==q&&(E=a.slice(0,q),a=a.slice(q+1),this.auth=decodeURIComponent(E)),A=-1;for(var T=0;T<m.length;T++){var M=a.indexOf(m[T]);-1!==M&&(-1===A||M<A)&&(A=M)}-1===A&&(A=a.length),this.host=a.slice(0,A),a=a.slice(A),this.parseHost(),this.hostname=this.hostname||"";var I="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!I)for(var L=this.hostname.split(/\./),T=0,N=L.length;T<N;T++){var F=L[T];if(F&&!F.match(g)){for(var H="",U=0,D=F.length;U<D;U++)F.charCodeAt(U)>127?H+="x":H+=F[U];if(!H.match(g)){var S=L.slice(0,T),_=L.slice(T+1),R=F.match(b);R&&(S.push(R[1]),_.unshift(R[2])),_.length&&(a="/"+_.join(".")+a),this.hostname=S.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),I||(this.hostname=h.toASCII(this.hostname));var k=this.port?":"+this.port:"",$=this.hostname||"";this.host=$+k,this.href+=this.host,I&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==a[0]&&(a="/"+a))}if(!x[d])for(var T=0,N=v.length;T<N;T++){var P=v[T];if(-1!==a.indexOf(P)){var z=encodeURIComponent(P);z===P&&(z=escape(P)),a=a.split(P).join(z)}}var K=a.indexOf("#");-1!==K&&(this.hash=a.substr(K),a=a.slice(0,K));var B=a.indexOf("?");if(-1!==B?(this.search=a.substr(B),this.query=a.substr(B+1),e&&(this.query=O.parse(this.query)),a=a.slice(0,B)):e&&(this.search="",this.query={}),a&&(this.pathname=a),j[d]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){var k=this.pathname||"",Z=this.search||"";this.path=k+Z}return this.href=this.format(),this},r.prototype.format=function(){var t=this.auth||"";t&&(t=encodeURIComponent(t),t=t.replace(/%3A/i,":"),t+="@");var e=this.protocol||"",n=this.pathname||"",r=this.hash||"",o=!1,s="";this.host?o=t+this.host:this.hostname&&(o=t+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(o+=":"+this.port)),this.query&&u.isObject(this.query)&&Object.keys(this.query).length&&(s=O.stringify(this.query));var i=this.search||s&&"?"+s||"";return e&&":"!==e.substr(-1)&&(e+=":"),this.slashes||(!e||j[e])&&!1!==o?(o="//"+(o||""),n&&"/"!==n.charAt(0)&&(n="/"+n)):o||(o=""),r&&"#"!==r.charAt(0)&&(r="#"+r),i&&"?"!==i.charAt(0)&&(i="?"+i),n=n.replace(/[?#]/g,function(t){return encodeURIComponent(t)}),i=i.replace("#","%23"),e+o+n+i+r},r.prototype.resolve=function(t){return this.resolveObject(o(t,!1,!0)).format()},r.prototype.resolveObject=function(t){if(u.isString(t)){var e=new r;e.parse(t,!1,!0),t=e}for(var n=new r,o=Object.keys(this),s=0;s<o.length;s++){var i=o[s];n[i]=this[i]}if(n.hash=t.hash,""===t.href)return n.href=n.format(),n;if(t.slashes&&!t.protocol){for(var a=Object.keys(t),h=0;h<a.length;h++){var c=a[h];"protocol"!==c&&(n[c]=t[c])}return j[n.protocol]&&n.hostname&&!n.pathname&&(n.path=n.pathname="/"),n.href=n.format(),n}if(t.protocol&&t.protocol!==n.protocol){if(!j[t.protocol]){for(var f=Object.keys(t),l=0;l<f.length;l++){var p=f[l];n[p]=t[p]}return n.href=n.format(),n}if(n.protocol=t.protocol,t.host||w[t.protocol])n.pathname=t.pathname;else{for(var d=(t.pathname||"").split("/");d.length&&!(t.host=d.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==d[0]&&d.unshift(""),d.length<2&&d.unshift(""),n.pathname=d.join("/")}if(n.search=t.search,n.query=t.query,n.host=t.host||"",n.auth=t.auth,n.hostname=t.hostname||t.host,n.port=t.port,n.pathname||n.search){var v=n.pathname||"",m=n.search||"";n.path=v+m}return n.slashes=n.slashes||t.slashes,n.href=n.format(),n}var y=n.pathname&&"/"===n.pathname.charAt(0),g=t.host||t.pathname&&"/"===t.pathname.charAt(0),b=g||y||n.host&&t.pathname,x=b,O=n.pathname&&n.pathname.split("/")||[],d=t.pathname&&t.pathname.split("/")||[],C=n.protocol&&!j[n.protocol];if(C&&(n.hostname="",n.port=null,n.host&&(""===O[0]?O[0]=n.host:O.unshift(n.host)),n.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===d[0]?d[0]=t.host:d.unshift(t.host)),t.host=null),b=b&&(""===d[0]||""===O[0])),g)n.host=t.host||""===t.host?t.host:n.host,n.hostname=t.hostname||""===t.hostname?t.hostname:n.hostname,n.search=t.search,n.query=t.query,O=d;else if(d.length)O||(O=[]),O.pop(),O=O.concat(d),n.search=t.search,n.query=t.query;else if(!u.isNullOrUndefined(t.search)){if(C){n.hostname=n.host=O.shift();var A=!!(n.host&&n.host.indexOf("@")>0)&&n.host.split("@");A&&(n.auth=A.shift(),n.host=n.hostname=A.shift())}return n.search=t.search,n.query=t.query,u.isNull(n.pathname)&&u.isNull(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.href=n.format(),n}if(!O.length)return n.pathname=null,n.search?n.path="/"+n.search:n.path=null,n.href=n.format(),n;for(var T=O.slice(-1)[0],M=(n.host||t.host||O.length>1)&&("."===T||".."===T)||""===T,E=0,q=O.length;q>=0;q--)T=O[q],"."===T?O.splice(q,1):".."===T?(O.splice(q,1),E++):E&&(O.splice(q,1),E--);if(!b&&!x)for(;E--;E)O.unshift("..");!b||""===O[0]||O[0]&&"/"===O[0].charAt(0)||O.unshift(""),M&&"/"!==O.join("/").substr(-1)&&O.push("");var I=""===O[0]||O[0]&&"/"===O[0].charAt(0);if(C){n.hostname=n.host=I?"":O.length?O.shift():"";var A=!!(n.host&&n.host.indexOf("@")>0)&&n.host.split("@");A&&(n.auth=A.shift(),n.host=n.hostname=A.shift())}return b=b||n.host&&O.length,b&&!I&&O.unshift(""),O.length?n.pathname=O.join("/"):(n.pathname=null,n.path=null),u.isNull(n.pathname)&&u.isNull(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.auth=t.auth||n.auth,n.slashes=n.slashes||t.slashes,n.href=n.format(),n},r.prototype.parseHost=function(){var t=this.host,e=f.exec(t);e&&(e=e[0],":"!==e&&(this.port=e.substr(1)),t=t.substr(0,t.length-e.length)),t&&(this.hostname=t)}},{"./util":7,punycode:1,querystring:4}],7:[function(t,e,n){"use strict";e.exports={isString:function(t){return"string"==typeof t},isObject:function(t){return"object"==typeof t&&null!==t},isNull:function(t){return null===t},isNullOrUndefined:function(t){return null==t}}},{}],8:[function(t,e,n){"use strict";function r(t,e){if(!t)throw new Error(e);return!0}function o(t,e,n){var r=void 0,o=void 0;for(o=0;(o=n.indexOf("url(",o))>0;o+=r.length){o+="url(".length,r=n.substring(o,n.indexOf(")",o));var s=a.resolve(e,r.replace(/(\"|\')/g,""));if(null!=t[s]){var i="'data:"+t[s].type+";base64,"+("base64"===t[s].encoding?t[s].data:u(t[s].data))+"'";n=""+n.substring(0,o)+i+n.substring(o+r.length)}}return n}var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=t("quoted-printable"),a=t("url"),h=void 0,u=void 0,c=void 0,f={noConflict:function(){return"undefined"!=typeof window&&(window.mhtml2html=h),f},parse:function(t,e){function n(){for(;r(w<t.length-1,"Unexpected EOF")&&/\s/.test(t[w]);)"\n"==t[++w]&&j++}function o(e){for(var n=w;"\n"!==t[w]&&r(w++<t.length-1,"Unexpected EOF"););w++,j++;var o=t.substring(n,w);switch(e){case"quoted-printable":return i.decode(o);case"base64":return o.trim();default:return o}}function s(t,e){var n=t.split(/[:=](.+)?/);r(n.length>=2,"Invalid header; Line "+j),e[n[0].trim()]=n[1].trim()}var a={MHTML_HEADERS:0,MTHML_CONTENT:1,MHTML_DATA:2,MHTML_END:3},h=void 0,u=void 0,f=void 0,l=void 0,p=void 0,d=void 0,v=void 0,m=void 0,y=void 0,g=void 0,b=void 0,x=void 0,w=void 0,j=void 0,O=void 0;for(u={},f={},l={},p={},g=a.MHTML_HEADERS,w=j=0;g!=a.MHTML_END;)switch(g){case a.MHTML_HEADERS:b=o(),0!=b&&"\n"!=b?s(b,u):(O=u.boundary,r(void 0!==O,"Missing boundary from document headers; Line "+j),O=O.replace(/\"/g,""),n(),b=o(),r(b.includes(O),"Expected boundary; Line "+j),f={},g=a.MTHML_CONTENT);break;case a.MTHML_CONTENT:b=o(),0!=b&&"\n"!=b?s(b,f):(v=f["Content-Transfer-Encoding"],m=f["Content-Type"],y=f["Content-ID"],d=f["Content-Location"],void 0===x&&(x=d,r(void 0!==x&&"text/html"===m,"Index not found; Line "+j)),r(void 0!==y||void 0!==d,"ID or location header not provided;  Line "+j),r(void 0!==v,"Content-Transfer-Encoding not provided;  Line "+j),r(void 0!==m,"Content-Type not provided; Line "+j),h={encoding:v,type:m,data:"",id:y},void 0!==y&&(p[y]=h),void 0!==d&&void 0===l[d]&&(l[d]=h),n(),f={},g=a.MHTML_DATA);break;case a.MHTML_DATA:for(b=o(v);!b.includes(O);)h.data+=b,b=o(v);try{h.data=decodeURIComponent(escape(h.data))}catch(t){}if(!0===e&&void 0!==x)return c(h.data);g=w>=t.length-1?a.MHTML_END:a.MTHML_CONTENT}return{frames:p,media:l,index:x}},convert:function(t){var e=void 0,n=void 0,a=void 0,h=void 0,l=void 0,p=void 0,d=void 0,v=void 0,m=void 0,y=void 0;"string"==typeof t?t=f.parse(t):r("object"===(void 0===t?"undefined":s(t)),"Expected argument of type string or object"),l=t.frames,h=t.media,a=t.index,r("object"===(void 0===l?"undefined":s(l)),"MHTML error: invalid frames"),r("object"===(void 0===h?"undefined":s(h)),"MHTML error: invalid media"),r("string"==typeof a,"MHTML error: invalid index"),r(h[a]&&"text/html"===h[a].type,"MHTML error: invalid index");for(var g=c(h[a].data),b=[g];b.length;)!function(){var t=b.shift();t.childNodes.forEach(function(r){switch(r.getAttribute&&(m=r.getAttribute("href"),y=r.getAttribute("src")),r.removeAttribute&&r.removeAttribute("integrity"),r.tagName){case"HEAD":d=g.createElement("base"),d.setAttribute("target","_parent"),r.insertBefore(d,r.firstChild);break;case"LINK":void 0!==h[m]&&"text/css"===h[m].type&&(p=g.createElement("style"),p.type="text/css",h[m].data=o(h,m,h[m].data),p.appendChild(g.createTextNode(h[m].data)),t.replaceChild(p,r));break;case"IMG":if(void 0!==h[y]&&h[y].type.includes("image")){switch(h[y].encoding){case"quoted-printable":e=i.decode(h[y].data),v="data:"+h[y].type+";utf8,"+e;break;case"base64":v="data:"+h[y].type+";base64,"+h[y].data;break;default:n=u(h[y].data),v="data:"+h[y].type+";base64,"+n}r.setAttribute("src",v)}r.style.cssText=o(h,a,r.style.cssText);break;default:r.style&&(r.style.cssText=o(h,a,r.style.cssText))}b.push(r)})}();return g}};!function(){"undefined"!=typeof window&&(h=window.mhtml2html);var e=void 0!==t?t:null;if(u="undefined"==typeof btoa?e("btoa"):btoa,"undefined"==typeof DOMParser){var n=e("jsdom").jsdom;c=function(t){return n(t,{})}}else{var r=new DOMParser;c=function(t){return r.parseFromString(t,"text/html")}}}(),e.exports=f},{"quoted-printable":5,url:6}]},{},[8])(8)});