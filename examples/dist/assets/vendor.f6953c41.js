function h(r){if(r.__esModule)return r;var t=Object.defineProperty({},"__esModule",{value:!0});return Object.keys(r).forEach(function(n){var u=Object.getOwnPropertyDescriptor(r,n);Object.defineProperty(t,n,u.get?u:{enumerable:!0,get:function(){return r[n]}})}),t}function b(r,t){return t=t||{},new Promise(function(n,u){var e=new XMLHttpRequest,c=[],f=[],s={},l=function(){return{ok:(e.status/100|0)==2,statusText:e.statusText,status:e.status,url:e.responseURL,text:function(){return Promise.resolve(e.responseText)},json:function(){return Promise.resolve(e.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([e.response]))},clone:l,headers:{keys:function(){return c},entries:function(){return f},get:function(a){return s[a.toLowerCase()]},has:function(a){return a.toLowerCase()in s}}}};for(var d in e.open(t.method||"get",r,!0),e.onload=function(){e.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(a,o,i){c.push(o=o.toLowerCase()),f.push([o,i]),s[o]=s[o]?s[o]+","+i:i}),n(l())},e.onerror=u,e.withCredentials=t.credentials=="include",t.headers)e.setRequestHeader(d,t.headers[d]);e.send(t.body||null)})}var m=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",default:b}),p=h(m),g=self.fetch||(self.fetch=p.default||p);export{g as b};