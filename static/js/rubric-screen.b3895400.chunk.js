(this["webpackJsonpminiapp-example"]=this["webpackJsonpminiapp-example"]||[]).push([[5],{310:function(e,t,n){"use strict";var a=n(0),c=n.n(a),o=n(311),r=n.n(o);t.a=function(e){return c.a.createElement("div",{className:[e.className,r.a.content].filter(Boolean).join(" ")},e.children)}},311:function(e,t,n){e.exports={content:"styles_content__2I1Dq"}},312:function(e,t,n){e.exports={button:"styles_button__2rAFr",active:"styles_active__2JFQe",tip:"styles_tip__2Q_6K"}},313:function(e,t,n){e.exports={container:"styles_container__2A-iM"}},314:function(e,t,n){"use strict";var a,c=n(9),o=n(0),r=n.n(o),i=n(4),l=n(60),s=n(124),u=n(125),m=n(312),b=n.n(m),d=function(e){var t=[b.a.button];return e.isActive&&t.push(b.a.active),e.tip&&t.push(b.a.tip),r.a.createElement("div",{className:t.join(" "),onClick:e.onClick},e.children)},f=n(313),p=n.n(f);!function(e){e.Today="Today",e.Tomorrow="Tomorrow"}(a||(a={}));t.a=Object(o.memo)((function(){var e=Object(i.b)(),t=Object(i.c)((function(e){return e.dateFilter})).date,n=Object(o.useMemo)((function(){return Object(u.b)(t)}),[t]),m=Object(o.useState)(function(e){if(Object(l.isTomorrow)(e))return a.Tomorrow;return a.Today}(n)),b=Object(c.a)(m,2),f=b[0],j=b[1],O=Object(o.useCallback)((function(){j(a.Today),e(Object(s.b)({date:Object(u.a)(Object(l.startOfToday)()),period:1}))}),[e]),_=Object(o.useCallback)((function(){j(a.Tomorrow),e(Object(s.b)({date:Object(u.a)(Object(l.startOfTomorrow)()),period:1}))}),[e]);return r.a.createElement("div",{className:p.a.container},r.a.createElement(d,{onClick:O,isActive:f===a.Today},"\u0421\u0435\u0433\u043e\u0434\u043d\u044f"),r.a.createElement(d,{onClick:_,isActive:f===a.Tomorrow},"\u0417\u0430\u0432\u0442\u0440\u0430"))}))},315:function(e,t,n){"use strict";var a=n(0),c=n.n(a),o=n(316),r=n.n(o);t.a=function(e){var t=e.children;return c.a.createElement("h2",{className:r.a.title},t)}},316:function(e,t,n){e.exports={title:"styles_title__1KYxF"}},317:function(e,t,n){"use strict";var a=n(0),c=n.n(a),o=n(8),r=n(318),i=n.n(r);t.a=function(){return c.a.createElement(o.b,{className:i.a.title})}},318:function(e,t,n){e.exports={title:"styles_title__357br"}},346:function(e,t,n){"use strict";n.r(t);var a=n(0),c=n.n(a),o=n(4),r=n(85),i=n(310),l=n(315),s=n(317),u=n(126),m=n(40),b=n(127),d=n(80),f=n(314),p=n(123),j={title:"",events:{items:[],paging:{offset:0,total:0}},hasMoreItems:!1,updatedAt:0},O={isLoading:!1,isLoadingMore:!1,isUpdating:!1};t.default=function(e){var t=e.code,n=Object(o.b)(),_=Object(o.c)(Object(r.d)(t))||j,v=_.events,E=_.hasMoreItems,y=_.title,T=Object(o.c)(Object(r.e)(t))||O,g=T.isLoading,h=T.isLoadingMore,k=Object(o.c)((function(e){return e.dateFilter})),w=Object(a.useCallback)((function(){n(Object(r.b)(t,k))}),[n,t,k]);return Object(p.a)(),c.a.createElement(c.a.Fragment,null,c.a.createElement(f.a,null),c.a.createElement(i.a,null,g?c.a.createElement(c.a.Fragment,null,c.a.createElement(s.a,null),c.a.createElement(m.a,{count:10,card:d.a})):c.a.createElement(c.a.Fragment,null,c.a.createElement(l.a,null,y),c.a.createElement(u.a,{type:"loadable",hasMore:E,loadMore:w,isLoadingMore:h,items:v.items,pageSize:10,component:b.a,skeleton:c.a.createElement(m.a,{count:3,card:d.a})}))))}}}]);
//# sourceMappingURL=rubric-screen.b3895400.chunk.js.map