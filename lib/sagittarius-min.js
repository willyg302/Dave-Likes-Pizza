function createCORSRequest(){var a=new XMLHttpRequest;return"withCredentials"in a||(a="undefined"!=typeof XDomainRequest?new XDomainRequest:null),a}function Sagittarius(a,b){this.appid=a,this.pass=b}Sagittarius.prototype.post=function(a,b,c){var d=createCORSRequest();d&&(window.XDomainRequest?d.onload=function(){c(d.responseText)}:d.onreadystatechange=function(){4==d.readyState&&c(d.responseText)},d.open("POST","http://"+this.appid+".appspot.com"+a+"?"+b,!0),d.send())},Sagittarius.prototype.GetLeaderboard=function(a){var b="act=get";a.hasOwnProperty("name")&&(b+="&n="+a.name),a.hasOwnProperty("limit")&&(b+="&rlim="+a.limit),a.hasOwnProperty("offset")&&(b+="&roff="+a.offset),this.post("/ldbds",b,a.callback)},Sagittarius.prototype.PostToLeaderboard=function(a){var b="act=post&score="+a.score+"&sid="+a.scoreid;a.hasOwnProperty("name")&&(b+="&n="+a.name),this.post("/ldbds",b,a.callback)};