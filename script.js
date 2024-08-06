let modifiedCode = document.getElementById('modified-file');
let originalCode = document.getElementById('original-file');
let lineCountCache = 0;
const HTMLDocStandard = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`;
const originalIframeHTML = "<iframe id='original-iframe'  class='w-100 ' ></iframe>"
const modifiedIframeHTML = "<iframe id='modified-iframe'  class='w-100 ' ></iframe>"
let originalWrapper = document.getElementById('original-wrapper');
let modifiedWrapper = document.getElementById('modified-wrapper');
let iframes = document.getElementsByTagName('iframe');
let m = iframes.length;
let HREF;
let newUrl;
let fileToUpload;
document.getElementById('upload-file').addEventListener('change', handleFileUpload, false);
document.getElementById('upload-new-file').addEventListener('change', handleFileUpload, false);
document.getElementById('upload-csv').addEventListener('change', handleCSVUpload, false);
$("#original-file").keyup(() => { 
    if($("#original-file").val()) {
         $("#submit-btn").removeClass("disabled"); 
         $("#dummy-wrapper").addClass("d-none"); 
     } 
     else{
        $("#submit-btn").addClass("disabled") 
    }
})
$(".regex-phrase").keyup(() => { 
    if($("#start-regex-phrase").val() && $("#end-regex-phrase").val()) {
         $("#regex-submit").removeClass("disabled"); 
     } 
     else{
        $("#regex-submit").addClass("disabled") 
    }
})

function originalIframeCodeUpdate(codeToUpdate) {
    originalWrapper.innerHTML = originalIframeHTML;
    document.getElementById("original-iframe").contentWindow.document.write(codeToUpdate);
    line_counter('modified');
    disableDownload();
    return codeToUpdate;
}

function modifiedIframeCodeUpdate(codeToUpdate) {
    modifiedWrapper.innerHTML = modifiedIframeHTML;
    document.getElementById("modified-iframe").contentWindow.document.write(codeToUpdate);
    line_counter('modified');
    disableDownload();
    return codeToUpdate;
}

function modifiedCodeUpdate(){
    modifiedCode.value = HTMLDocStandard + "\n" + document.querySelector("#modified-iframe").contentDocument.documentElement.outerHTML;
}

let handleSubmit = async function () {
    purgeContainers();
    $(".sidebar").toggleClass('show');
    $(".code-editor").toggleClass('reduced');
    $(".nav-tabs").toggleClass('show');
    $(".header-button-container, .inner-header-button-container").toggleClass('d-none');
    $(".logo-container").toggleClass('show');
    $("#submit-container").toggleClass("d-none");
    await originalIframeCodeUpdate(originalCode.value);
    await modifiedIframeCodeUpdate(originalCode.value);
    handleEventsInAnchor();
    // handleToast('Submission successful','success');
}

let handleEventsInAnchor = function () {
    for (let j = 0; j < m; j++) {
        HREF = iframes[1].contentDocument.querySelectorAll("a");        
    }
    for (let d = 0; d < HREF.length; d++) {
        HREF[d].addEventListener("click", (evt) => {
            evt.preventDefault();
            $(".hidden-link-modal").click();
            $("#new-url").val("");
            $("#current-url").val(evt.currentTarget.href);
            newUrl = HREF[d];
            ((evt.currentTarget).outerHTML) ? $("#alias").val(evt.currentTarget.getAttribute("alias")) : $("#alias").val("");
        })
    }
}

let handleHREFTrack = function () {
    for (let d = 0; d < HREF.length; d++) {
        let HREFTag = HREF[d].href;
        if (HREFTag && HREFTag !== regexCall(HREFTag)) {
            HREF[d].href = regexCall(HREFTag);
        }
    }
    handleToast('Tracking URL removed successfully', 'success');
    modifiedCodeUpdate();
    line_counter('modified');
    disableDownload();
    anchorRefresh();
}

let regexCall = function (strToMatch) {
    // let regex =  strToMatch.match(new RegExp(/(?<=\[@trackurl%20.*\])(https?:\/\/(?:www\.)?[^\s]+)(?=\?utm)/)); 
    // let regex2 = strToMatch.match(new RegExp(/(?<=\[@trackurl%20.*\])(https?:\/\/(?:www\.)?[^\s]+)(?=\[\/@trackurl\])/));
    // const regex = strToMatch.match(new RegExp(/https?:\/\/[^\s\[\]?]+(?=\[\/@trackurl|\?utm|$)/g));
    const regex = strToMatch.match(new RegExp(/https?:\/\/[^\s\[\]?]+(?=\[\/@trackurl|\?utm|\?site|$)/g));
    if (regex) {
        return regex[0];
    }
    // else if (regex2) {
    //     return regex2[0];
    // }
    return strToMatch;
}

let handleAnchorHighlight = function (evt) {
    $('#save-changes-anchor').addClass('disabled');
    $(".hidden-anchor-modal").click();
    $('#upload-csv').val('');
    let anchorModalBody = document.getElementById("inner-anchor-modal-body");
    anchorModalBody.innerHTML = '';

    let fragment = document.createDocumentFragment();

    HREF.forEach((href, index) => {   
        let container = document.createElement('div');
        container.className = 'iframe-input-container';

        let iframe = document.createElement('iframe');
        iframe.id = `iframe-anchor-${index + 1}`;
        iframe.height = '50';
        iframe.className = 'anchor-iframe';
        iframe.scrolling = 'no';
        iframe.srcdoc = `<div class="iframe-inner-container">${href.outerHTML}</div>`;
        container.appendChild(iframe);

        let inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';

        let currentUrlField = document.createElement('input');
        currentUrlField.type = 'text';
        currentUrlField.value = href.href;
        currentUrlField.title = href.href;
        currentUrlField.readOnly = true;
        currentUrlField.id = `current-anchor-${index + 1}`;
        currentUrlField.className = 'current-url form-control';
        inputContainer.appendChild(currentUrlField);

        let inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = `input-anchor-${index + 1}`;
        inputField.placeholder = 'Enter new href';
        inputField.className = 'new-url form-control';
        inputField.addEventListener('keyup',()=>$('#save-changes-anchor').removeClass('disabled'))
        inputContainer.appendChild(inputField);

        let aliasField = document.createElement('input');
        aliasField.type = 'text';
        aliasField.id = `alias-anchor-${index + 1}`;
        aliasField.placeholder = 'Enter alias';
        aliasField.className = 'alias-url form-control';
        aliasField.value = href.getAttribute("alias") || '';
        aliasField.addEventListener('keyup',()=>$('#save-changes-anchor').removeClass('disabled'))
        inputContainer.appendChild(aliasField);

        let copyButton = document.createElement('button');
        copyButton.innerHTML = 'Copy';
        copyButton.type = 'button';
        copyButton.className = 'btn btn-secondary';
        copyButton.onclick = () => { inputField.value = currentUrlField.value; };
        inputContainer.insertBefore(copyButton, inputField);

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-anchor-${index + 1}`;
        checkbox.className = 'form-check-input';
        checkbox.checked = true;
        inputContainer.appendChild(checkbox);

        container.appendChild(inputContainer);
        fragment.appendChild(container);
    });

    anchorModalBody.appendChild(fragment);

    document.getElementById("save-changes-anchor").onclick = function () {
        HREF.forEach((href, index) => {
            let checkbox = document.getElementById(`checkbox-anchor-${index + 1}`);
            if (checkbox.checked) {
                let newHref = document.getElementById(`input-anchor-${index + 1}`).value.trim();
                let alias = document.getElementById(`alias-anchor-${index + 1}`).value.trim();
                let mainIframe = document.getElementById('modified-iframe');
                let anchor = mainIframe.contentDocument.querySelectorAll('a')[index];

                if (anchor && anchor.hasAttribute('href')) {
                    anchor.href = newHref || href.href;
                    if (alias) {
                        anchor.setAttribute("alias", alias);
                    } else {
                        anchor.removeAttribute("alias");
                    }
                }
            }
        });
        modifiedCodeUpdate();
        line_counter('modified');
        disableDownload();
        handleToast('Anchor Links have been updated successfully', 'success');
    };
};

let anchorRefresh = function () {
    HREF.forEach((href, index) => {
        let currentUrlField = document.getElementById(`current-anchor-${index + 1}`);
        currentUrlField.value = href.href;
        currentUrlField.title = href.href;
    })
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file.type !== 'text/csv') {
        handleToast('Please upload a valid CSV file','error');
        $('#upload-csv').val('');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));

        const headers = rows.shift().map(header => header.trim().toLowerCase());
        const newUrlIndex = headers.indexOf('new_url');
        const aliasIndex = headers.indexOf('alias');

        if (newUrlIndex === -1 || aliasIndex === -1) {
            handleToast('CSV must contain "new-url" and "alias" columns','error');
            return;
        }

        let currentIndex = 0;

        rows.forEach((columns) => {
            const newUrl = columns[newUrlIndex]?.trim() || '';
            const alias = columns[aliasIndex]?.trim() || '';

            while (currentIndex < HREF.length) {
                const currentUrlField = document.getElementById(`current-anchor-${currentIndex + 1}`);

                if (currentUrlField && currentUrlField.value.trim() !== '') {
                    const inputField = document.getElementById(`input-anchor-${currentIndex + 1}`);
                    const aliasField = document.getElementById(`alias-anchor-${currentIndex + 1}`);

                    if (inputField) inputField.value = newUrl;
                    if (aliasField) aliasField.value = alias;

                    currentIndex++;
                    break;
                }

                currentIndex++;
            }
        });
    };
    reader.readAsText(file);
    $("#save-changes-anchor").removeClass('disabled')
    handleToast('New URLs loaded succesfully', 'success');
}

$("#save-changes-url").click(() => {
    if ($("#new-url").val()) newUrl.href = $("#new-url").val();
    if ($("#alias").val()) newUrl.setAttribute("alias", $("#alias").val());
    modifiedCodeUpdate();
    line_counter('modified');
    disableDownload();
})

let handleExtraction = async function () {
    let IMGmatches = new Map();
    let j;
    for (j = 0; j < m; j++) {
        let IMGelems = iframes[1].contentDocument.getElementsByTagName("img");
        let IMGBgelems = iframes[1].contentDocument.getElementsByTagName("td");
        for (let d = 0; d < IMGelems.length; d++) {
            IMGmatches.set(IMGelems[d].src, IMGelems[d].alt);
        }
        for (let d = 0; d < IMGBgelems.length; d++) {
            if (IMGBgelems[d].getAttribute("background")) IMGmatches.set(IMGBgelems[d].getAttribute("background"), "");
        }
    }
    $(".hidden-image-modal").click();
    $('#save-changes-img').addClass('disabled');
    let imageModalBody = document.getElementById("inner-image-modal-body");
    imageModalBody.innerHTML = '';

    let fragment = document.createDocumentFragment();

    IMGmatches.forEach((alt, src) => {   
        let container = document.createElement('div');
        container.className = 'iframe-input-container';

        let inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';

        let imgContainerOuter = document.createElement('div');
        imgContainerOuter.className = 'img-container-outer';
        imgContainerOuter.style.background = '#bbbbbb';
        imgContainerOuter.style.padding = '5px';
        imgContainerOuter.style.marginBottom = '10px';

        let imgContainer = document.createElement('div');
        imgContainer.className = 'img-container';
        imgContainer.style.background = '#bbbbbb';

        let imgElement = document.createElement('img');
        imgElement.src = src;
        imgElement.alt = alt;
        imgElement.className = 'img-preview';
        
        imgContainer.appendChild(imgElement);
        imgContainerOuter.appendChild(imgContainer);
        inputContainer.appendChild(imgContainerOuter);

        let currentImgField = document.createElement('input');
        currentImgField.type = 'text';
        currentImgField.value = src;
        currentImgField.readOnly = true;
        currentImgField.id = `current-img-${src}`;
        currentImgField.className = 'current-img form-control';
        inputContainer.appendChild(currentImgField);

        let inputImgField = document.createElement('input');
        inputImgField.type = 'text';
        inputImgField.id = `input-img-${src}`;
        inputImgField.placeholder = 'Enter new src';
        inputImgField.className = 'new-img form-control';
        inputImgField.addEventListener('keyup',()=>$('#save-changes-img').removeClass('disabled'));
        inputContainer.appendChild(inputImgField);

        let altField = document.createElement('input');
        altField.type = 'text';
        altField.id = `alt-img-${src}`;
        altField.placeholder = 'Enter alt text';
        altField.className = 'alt-url form-control';
        altField.value = alt;
        altField.addEventListener('keyup',()=>$('#save-changes-img').removeClass('disabled'));
        inputContainer.appendChild(altField);

        container.appendChild(inputContainer);
        fragment.appendChild(container);
    });
    imageModalBody.appendChild(fragment);

    document.getElementById("save-changes-img").onclick = function () {
        IMGmatches.forEach((alt, src) => {
            let newSrc = document.getElementById(`input-img-${src}`).value.trim();
            let newAlt = document.getElementById(`alt-img-${src}`).value.trim();
            let mainIframe = document.getElementById('modified-iframe');
            let img = mainIframe.contentDocument.querySelector(`img[src="${src}"]`);

            if (img && img.hasAttribute('src')) {
                img.src = newSrc || src;
                if (newAlt) {
                    img.setAttribute("alt", newAlt);
                } else {
                    img.removeAttribute("alt");
                }
            }
        });
        handleToast('Changes saved successfully','success');
        modifiedCodeUpdate();
        line_counter('modified');
        disableDownload();
    };
    setTimeout(() => {
        $('.img-container').each(function() {
            $(this).hover(
                function() {
                    $(this).css("overflow", "visible");
                },
                function() {
                    $(this).css("overflow", "hidden");
                }
            );
        });
    }, 0);
    // handleImageDownload(IMGmatches); //Added For Image Download
}

let handleImageDownload = function (IMGDownload) {

    let totalImages = IMGDownload.size;
    let downloadedImages = 0;

    for (let idx of [...IMGDownload]) {
        let proxyURL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(idx[0]);
        fetch(proxyURL)
            .then(response => response.blob())
            .then(blob => {
                let filename = idx[0].substring(idx[0].lastIndexOf('/') + 1);
                let url = window.URL.createObjectURL(blob);
                let dummyAnchor = document.createElement('a');
                dummyAnchor.href = url;
                dummyAnchor.download = filename;
                document.body.appendChild(dummyAnchor);
                dummyAnchor.click();
                document.body.removeChild(dummyAnchor);
                window.URL.revokeObjectURL(url);

                downloadedImages++;
                let progressBar = document.getElementById('loaderBar');
                progressBar.style.width = (downloadedImages / totalImages) * 100 + '%';

                if (downloadedImages === totalImages) {
                    setTimeout(() => {
                        progressBar.style.width = '0%';
                    }, 1000); // Reset after 1 second
                }
            })
            .catch(error => console.error('Error downloading image:', error));
    };
}

$("#start-regex-phrase").val(`\\[\\#if`)
$("#end-regex-phrase").val(`\\#if\\]`);
$("#regex-submit").click(()=>{
    let start = $("#start-regex-phrase").val();
    let end = $("#end-regex-phrase").val();
    let iFrameCode = document.querySelector("#modified-iframe").contentDocument.documentElement.outerHTML;
    let regex = new RegExp(`${start}.*?${end}`, "gs");
    let regexMatches = iFrameCode.match(regex);
    // let regex = iFrameCode.match(new RegExp(/\[\#if.*/gs))[0].match(new RegExp(/\[\#if(.*?)(\/\#if\])/gs))
    let PersonalisationModalBody = document.getElementById("inner-personalisation-modal-body");
    PersonalisationModalBody.innerHTML = '';

    let fragment = document.createDocumentFragment();

    console.log(regexMatches);
    if (regexMatches == null || regexMatches.length == 0 ) {
        $('#inner-personalisation-modal-body').html('No Results Found')
    }
    else{
        regexMatches.forEach((script, idx) => {
            let container = document.createElement('div');
            container.className = 'iframe-input-container';
    
            let inputContainer = document.createElement('div');
            inputContainer.className = 'input-container d-flex flex-grow-1 m-0';
    
            let currentPersonalisation = document.createElement('textarea');
            currentPersonalisation.type = 'text';
            currentPersonalisation.value = script;
            currentPersonalisation.readOnly = true;
            currentPersonalisation.id = `current-personalisation-${idx}`;
            currentPersonalisation.className = 'current-personalisation form-control';
            currentPersonalisation.setAttribute('rows',7);
            inputContainer.appendChild(currentPersonalisation);
    
            let inputPersonalisation = document.createElement('textarea');
            inputPersonalisation.type = 'text';
            inputPersonalisation.id = `input-personalisation-${idx}`;
            inputPersonalisation.placeholder = 'Enter Replacement Script';
            inputPersonalisation.className = 'new-personalisation form-control';
            inputPersonalisation.setAttribute('rows',7);
            inputContainer.appendChild(inputPersonalisation);

            let checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'd-flex justify-content-center w-150'
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-personalisation-${idx}`;
            checkbox.className = 'form-check-input';
            checkbox.checked = true;
            checkboxContainer.appendChild(checkbox)
            inputContainer.appendChild(checkboxContainer);
    
            container.appendChild(inputContainer);
            fragment.appendChild(container);
        });
    }
    PersonalisationModalBody.appendChild(fragment);

    document.getElementById("save-changes-personalisation").onclick = function () {
        let updatedCode = iFrameCode;
        
            regexMatches.forEach((script, index) => {
                let checkbox = document.getElementById(`checkbox-personalisation-${index}`);
                if (checkbox.checked) {
                    let newScript = document.getElementById(`input-personalisation-${index}`).value.trim();
                    updatedCode = updatedCode.replace(script, newScript);
                }
            });  
    
        modifiedCode.value = HTMLDocStandard + "\n" + updatedCode;
        handleToast('Changes saved successfully','success')
        modifiedIframeCodeUpdate(modifiedCode.value);
        handleEventsInAnchor();
    };
})

let handleAmpscript = async function () {
    $(".hidden-personalisation-modal").click();
    let PersonalisationModalBody = document.getElementById("inner-personalisation-modal-body");
    PersonalisationModalBody.innerHTML = '';
}

let handleCodeCompare = function(){
    $("#editor-container").toggleClass('some-style');
    $("#original-code-container").toggleClass('some-style2');
    $("#modified-code-container").toggleClass('some-style2 d-none');
    $("#original-wrapper, .inner-original-btn").toggleClass('d-none');
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

function disableDownload() {
    if (modifiedCode.value == "") {
        $('#download-btn').addClass("disabled");
    }
    else {
        $('#download-btn').removeClass("disabled");
    }
}

function dropOverDropzone(evt) {
    evt.preventDefault();
    $("#drop-zone").css("zIndex", -1);
    $("#drop-animation").addClass("d-none");
    $("#dummy-wrapper").addClass("d-none");
    if (evt.dataTransfer.items && evt.dataTransfer.items.length === 1) {
        let item = evt.dataTransfer.items[0]
        if (item.kind === "file" && item.type === "text/html") {
            const file = item.getAsFile();
            if (originalCode.value !== "") {
                $(".hidden-upload-modal").click(() => {
                    fileToUpload = file;
                });
                $(".hidden-upload-modal").click();
            }
            else {
                readFile(file);
            }
            $("#upload-container").addClass("d-none");
        }
        else {
            handleToast('Please upload a valid HTML File', 'error');
        }
    }
    else {
        handleToast('Please upload one file at a time.', 'error');
    }
}

function handleFileUpload(evt) {
    let file = evt.target.files[0];
    if (file.type === "text/html") {
        if (originalCode.value !== "") {
            $(".hidden-upload-modal").click(() => {
                fileToUpload = file;
            });
            $(".hidden-upload-modal").click();
        }
        else {
            readFile(file);
        }
        $("#upload-container").addClass("d-none");
        $("#dummy-wrapper").addClass("d-none");
    }
    else {
        $("#upload-file").val("");
        handleToast('Please select a valid HTML File', 'error');
    }
}

$("#save-changes-upload").click(() => {
    readFile(fileToUpload);
    handleToast(`${fileToUpload.name} is uploaded successfully`,'success')
    $(".sidebar").toggleClass('show');
    $(".code-editor").toggleClass('reduced');
    $(".nav-tabs").toggleClass('show');
    $(".header-button-container, .inner-header-button-container").toggleClass('d-none');
    $(".logo-container").toggleClass('show');
    $("#submit-container").toggleClass("d-none");
    handleCodeCompare();
})

async function readFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (event) => {
            const fileContents = event.target.result;
            $("#original-file").val(fileContents);
            line_counter("original");
            $("#submit-btn").removeClass("disabled");
            resolve(file);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
}

function dragOverDropzone(evt) {
    evt.preventDefault();
}

function dragOverTextarea(evt) {
    evt.preventDefault();
    $("#drop-zone").css("zIndex", 1000);
    $("#drop-animation").removeClass("d-none");
    $("#dummy-wrapper").removeClass("d-none");
}

function dragLeaveDropzone(evt) {
    evt.preventDefault();
    $("#drop-animation").addClass("d-none");
    $("#drop-zone").css("zIndex", -1);
    $("#dummy-wrapper").removeClass("d-none");
}

window.addEventListener("dragover", function (e) {
    e.preventDefault();
    if (e.target.id !== "drop-zone") {
        e.dataTransfer.effectAllowed = 'none';
        e.dataTransfer.dropEffect = 'none';
    }
}, false);

window.addEventListener("drop", function (e) {
    e.preventDefault();
}, false);

function handleCloseUpload() {
    $("#upload-file").val("");
}

let purgeContainers = function () {
    modifiedCode.value = "";
    disableDownload();
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

function line_scroll(ele) {
    document.getElementById(`${ele}-line-counter`).scrollTop = document.getElementById(`${ele}-file`).scrollTop;
    document.getElementById(`${ele}-line-counter`).scrollLeft = document.getElementById(`${ele}-file`).scrollLeft;
}

let handleToggleScreen = function (evt) {
    if (evt.dataset.bool == "mobile") {
        $(".wrapper").width("425px");
    }
    else {
        $(".wrapper").width("100%");
    }
}

let handleToast = function (toastMessage, toastType) {
    $.toast({
        text: toastMessage,
        position: 'bottom-right',
        icon: toastType,
        stack: 5,
        loader: false,
        hideAfter: 4000
    })
}

$(".nav-link").click((evt)=>{
    $(".nav-link").removeClass("active");
    $(evt.target).addClass("active");
    $(".tab-menu").removeClass("d-none");
    $('#'+$(evt.target).attr('tab')).addClass("d-none")
})