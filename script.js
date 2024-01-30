var modifiedCode = document.getElementById('modified-file');
var lineCountCache = 0;
let code;
const HTMLDocStandard = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`;
let wrapper = document.getElementById('wrapper');
let iframes = document.getElementsByTagName('iframe');
let m = iframes.length;
let HREF;
let newUrl;

let handleSubmit = function () {
    code = document.getElementById("original-file").value;
    wrapper.innerHTML = "<iframe id='my-iframe' height='1000'  class='w-100 '></iframe>";
    document.getElementById("my-iframe").contentWindow.document.write(code);
    setTimeout(() => {
        handleEventsInAnchor();    
    }, 1000);   
}

let handleEventsInAnchor = function() {
    for (let j = 0; j < m; j++) {
        HREF = iframes[j].contentDocument.querySelectorAll("a");
    }
    for (let d = 0; d < HREF.length; d++) {
        HREF[d].addEventListener("click", (evt)=>{
            evt.preventDefault();
            $(".hidden-modal").click();
            $("#current-url").val(evt.currentTarget.href);
            newUrl=HREF[d];
        })
    }
}

let handleExtraction = function () {
    let IMGmatches = new Set();
    let j;
    for (j = 0; j < m; j++) {
        let IMGelems = iframes[j].contentDocument.getElementsByTagName("img");
        let IMGBgelems = iframes[j].contentDocument.getElementsByTagName("td");
        for (let d = 0; d < IMGelems.length; d++) {
            IMGmatches.add(IMGelems[d].src);
        }
        for (let d = 0; d < IMGBgelems.length; d++) {
            if (IMGBgelems[d].getAttribute("background")) IMGmatches.add(IMGBgelems[d].getAttribute("background"));
        }
    }
    $(".image-picker").html('');
    for (let idx in [...IMGmatches]) {
        $(".image-picker").append('<option data-img-src="' + [...IMGmatches][idx] + '">' + [...IMGmatches][idx] + '</option>')
    }
    $(".image-picker").imagepicker({
        hide_select: true
    });
    // downloadResource('https://images.harmony.epsilon.com/ContentHandler/images/263f4ea1-4cf5-4c5e-a8d9-ae73663e97af/20201636_Inclisiran_Unbranded_Consumer_2020_FF_Campaign/148868_images/148868_XIN_CRM_Unbranded_Market-Prep_T4_01.png');   
}

$("#save-changes").click(()=>{
    if($("#new-url").val()) newUrl.href=$("#new-url").val();
    if($("#alias").val()) newUrl.setAttribute("alias",$("#alias").val());
    modifiedCode.value = HTMLDocStandard + "\n" + document.querySelector("iframe").contentDocument.documentElement.outerHTML;
    line_counter('modified');
})

let handleHREFTrack = function () {

    for (let d = 0; d < HREF.length; d++) {
        let HREFTag = HREF[d].href;
        if (HREFTag) {
            HREF[d].href = regexCall(HREFTag);
        }
    }
    modifiedCode.value = HTMLDocStandard + "\n" + document.querySelector("iframe").contentDocument.documentElement.outerHTML;
    line_counter('modified');
}

let handleAmpscript = function () {
    let iFramecode = document.querySelector("iframe").contentDocument.documentElement.outerHTML;
    let regex = iFramecode.match(new RegExp(/\[\#if.*/gs))[0].match(new RegExp(/\[\#if(.*?)(\/\#if\])/gs))
    modifiedCode.value = HTMLDocStandard + "\n" + iFramecode.replace(regex[0], "");
    wrapper.innerHTML = "<iframe id='my-iframe' height='1000'  class='w-100 ' ></iframe>";
    document.getElementById("my-iframe").contentWindow.document.write(modifiedCode.value);
    line_counter('modified');
    setTimeout(() => {
        handleEventsInAnchor();    
    }, 1000);
}

$('#download-btn').click(function (e) {
    e.preventDefault();
    const link = document.createElement("a");
    const file = new Blob([modifiedCode.value], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "index.html";
    link.click();
    URL.revokeObjectURL(link.href);
});

let regexCall = function (strToMatch) {
    let regex = strToMatch.match(new RegExp(/https(.*?)(?=\?utm)/gs));
    let regex2 = strToMatch.match(new RegExp(/https(.*?)(?=\[\/\@trackurl)/gs))
    if (regex) {
        return regex[0];
    }
    else if (regex2) {
        return regex2[0];
    }
    return strToMatch;
}

function line_counter(ele) {
    var lineCount = document.getElementById(`${ele}-file`).value.split('\n').length;
    var outarr = new Array();
    if (lineCountCache != lineCount) {
        for (var x = 0; x < lineCount; x++) {
            outarr[x] = (x + 1) + '.';
        }
        document.getElementById(`${ele}-line-counter`).value = outarr.join('\n');
    }
    lineCountCache = lineCount;
}

function line_scroll(ele){
    document.getElementById(`${ele}-line-counter`).scrollTop = document.getElementById(`${ele}-file`).scrollTop;
    document.getElementById(`${ele}-line-counter`).scrollLeft = document.getElementById(`${ele}-file`).scrollLeft;
}

let handleToggleScreen = function(evt){
    if(evt.dataset.bool == "mobile"){ 
        evt.innerHTML="Toggle to Desktop Screen";
        evt.dataset.bool="desktop";
        $("#wrapper").width("425px");
    }
    else{ 
        evt.innerHTML="Toggle to Mobile Screen";
        evt.dataset.bool="mobile";
        $("#wrapper").width("100%");
    }
}


// let k = 0;
//     setInterval(function(){
//     if(IMGmatches.size > k){            
//         var link = document.createElement("a");      
//         link.id=k;        
//         link.download = [...IMGmatches][k];        
//         link.href = [...IMGmatches][k];        
//         link.target = "_blank";        
//         link.click();        
//         // let regex = /(?<=\/)[^\/\?#]+(?=[^\/]*$)/;        
//         // let fileName = regex.exec(IMGmatches[k].src); 
//         // downloadResource([...IMGmatches][k]);
//         k++;    
//     }},1500);

