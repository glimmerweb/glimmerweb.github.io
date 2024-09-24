const inputTypeSelect = document.getElementById("inputType");
const inputSection = document.getElementById("inputSection");
const renderBtn = document.getElementById("renderBtn");
const exportBtn = document.getElementById("exportBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const canvas = document.getElementById("canvas");
const exportArea = document.getElementById("exportArea");

const stylePanel = document.getElementById("stylePanel");
const elementIdInput = document.getElementById("elementId");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const backgroundColorInput = document.getElementById("backgroundColor");
const fontSizeInput = document.getElementById("fontSize");
const colorInput = document.getElementById("color");
const zIndexInput = document.getElementById("zIndex");
const applyStyleBtn = document.getElementById("applyStyleBtn");

let uploadedHTML = "";
let uploadedCSS = "";
let uploadedJS = "";

let historyStack = [];
let redoStack = [];

let selectedElement = null;

updateInputFields();

inputTypeSelect.addEventListener("change", updateInputFields);

function updateInputFields() {
  const selectedType = inputTypeSelect.value;
  inputSection.innerHTML = "";

  if (selectedType === "upload") {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "htmlFileInput";
    fileInput.accept = ".html";

    const label = document.createElement("label");
    label.htmlFor = "htmlFileInput";
    label.textContent = "Choose HTML File:";

    inputSection.appendChild(label);
    inputSection.appendChild(fileInput);
  } else if (selectedType === "paste-embedded") {
    const textarea = document.createElement("textarea");
    textarea.id = "embeddedCode";
    textarea.placeholder = "Paste your HTML with embedded CSS and JS here...";

    inputSection.appendChild(textarea);
  } else if (selectedType === "paste-separate") {
    const htmlTextarea = document.createElement("textarea");
    htmlTextarea.id = "htmlCode";
    htmlTextarea.placeholder = "Paste your HTML here...";

    const cssTextarea = document.createElement("textarea");
    cssTextarea.id = "cssCode";
    cssTextarea.placeholder = "Paste your CSS here...";

    const jsTextarea = document.createElement("textarea");
    jsTextarea.id = "jsCode";
    jsTextarea.placeholder = "Paste your JS here...";

    inputSection.appendChild(htmlTextarea);
    inputSection.appendChild(cssTextarea);
    inputSection.appendChild(jsTextarea);
  }
}

renderBtn.addEventListener("click", () => {
  const selectedType = inputTypeSelect.value;

  if (selectedType === "upload") {
    const fileInput = document.getElementById("htmlFileInput");
    const file = fileInput.files[0];
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = function (e) {
        const htmlContent = e.target.result;
        processEmbeddedHTML(htmlContent);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid HTML file.");
    }
  } else if (selectedType === "paste-embedded") {
    const embeddedCode = document.getElementById("embeddedCode").value.trim();
    if (embeddedCode) {
      processEmbeddedHTML(embeddedCode);
    } else {
      alert("Please paste your HTML code.");
    }
  } else if (selectedType === "paste-separate") {
    const htmlCode = document.getElementById("htmlCode").value.trim();
    const cssCode = document.getElementById("cssCode").value.trim();
    const jsCode = document.getElementById("jsCode").value.trim();

    if (!htmlCode) {
      alert("Please paste your HTML code.");
      return;
    }

    uploadedHTML = htmlCode;
    uploadedCSS = cssCode;
    uploadedJS = jsCode;

    renderContent();
  }
});

function processEmbeddedHTML(htmlContent) {
  uploadedHTML = "";
  uploadedCSS = "";
  uploadedJS = "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const styleTags = doc.querySelectorAll("style");
  styleTags.forEach((tag) => {
    uploadedCSS += tag.innerHTML + "\n";
  });

  const scriptTags = doc.querySelectorAll("script");
  scriptTags.forEach((tag) => {
    if (tag.src) {
      console.warn(`External script ${tag.src} is ignored.`);
    } else {
      uploadedJS += tag.innerHTML + "\n";
    }
  });

  uploadedHTML = doc.body.innerHTML;

  renderContent();
}

function renderContent() {
  canvas.innerHTML = "";
  removeExistingStyle();
  removeExistingScript();
  clearHistory();

  if (uploadedCSS) {
    applyCSS(uploadedCSS);
  }

  if (uploadedJS) {
    applyJS(uploadedJS);
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = uploadedHTML;

  Array.from(tempDiv.children).forEach((child, index) => {
    const elem = child.cloneNode(true);

    if (!elem.id) {
      elem.id = `elem-${index}`;
    }

    const computedStyle = window.getComputedStyle(elem);
    if (computedStyle.position === "static") {
      elem.style.position = "absolute";
      elem.style.left = "0px";
      elem.style.top = "0px";
    }

    elem.classList.add("draggable");

    makeDraggable(elem);
    makeResizable(elem);

    addElementEventListeners(elem);

    canvas.appendChild(elem);
  });

  deselectElement();
}

function applyCSS(css) {
  const styleTag = document.createElement("style");
  styleTag.id = "uploadedStyles";
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);
}
function applyJS(js) {
  const scriptTag = document.createElement("script");
  scriptTag.id = "uploadedScript";
  scriptTag.innerHTML = js;
  document.body.appendChild(scriptTag);
}

function removeExistingStyle() {
  const existingStyle = document.getElementById("uploadedStyles");
  if (existingStyle) {
    existingStyle.remove();
  }
}

function removeExistingScript() {
  const existingScript = document.getElementById("uploadedScript");
  if (existingScript) {
    existingScript.remove();
  }
}

function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resize-handle")) {
      return;
    }
    isDragging = true;
    const rect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    offsetX = e.clientX - rect.left + canvas.scrollLeft;
    offsetY = e.clientY - rect.top + canvas.scrollTop;
    el.style.zIndex = 1000;

    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const canvasRect = canvas.getBoundingClientRect();
      let left = e.clientX - canvasRect.left - offsetX;
      let top = e.clientY - canvasRect.top - offsetY;

      left = Math.max(0, Math.min(left, canvas.clientWidth - el.offsetWidth));
      top = Math.max(0, Math.min(top, canvas.clientHeight - el.offsetHeight));

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      el.style.zIndex = "";
      saveHistory();
    }
  });
}
function makeResizable(el) {
  const resizeHandle = document.createElement("div");
  resizeHandle.classList.add("resize-handle");
  el.appendChild(resizeHandle);

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  resizeHandle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    document.body.style.cursor = "se-resize";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.width = `${startWidth + dx}px`;
      el.style.height = `${startHeight + dy}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = "default";
      saveHistory();
    }
  });
}

function addElementEventListeners(el) {
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    selectElement(el);
  });

  el.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    makeElementEditable(el);
  });
}

function selectElement(el) {
  if (selectedElement && selectedElement !== el) {
    selectedElement.classList.remove("selected");
  }
  selectedElement = el;
  selectedElement.classList.add("selected");
  populateStylePanel(selectedElement);
}

function deselectElement() {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
    selectedElement = null;
    clearStylePanel();
  }
}

function populateStylePanel(el) {
  elementIdInput.value = el.id;
  widthInput.value = parseInt(el.style.width) || el.offsetWidth;
  heightInput.value = parseInt(el.style.height) || el.offsetHeight;
  backgroundColorInput.value = rgbToHex(el.style.backgroundColor) || "#ffffff";
  fontSizeInput.value = parseInt(getComputedStyle(el).fontSize) || 16;
  colorInput.value = rgbToHex(getComputedStyle(el).color) || "#000000";
  zIndexInput.value = el.style.zIndex || 1;
}

function clearStylePanel() {
  elementIdInput.value = "";
  widthInput.value = "";
  heightInput.value = "";
  backgroundColorInput.value = "#ffffff";
  fontSizeInput.value = "";
  colorInput.value = "#000000";
  zIndexInput.value = "";
}

applyStyleBtn.addEventListener("click", () => {
  if (!selectedElement) {
    alert("Please select an element to apply styles.");
    return;
  }

  saveHistory();

  selectedElement.style.width = `${widthInput.value}px`;
  selectedElement.style.height = `${heightInput.value}px`;
  selectedElement.style.backgroundColor = backgroundColorInput.value;
  selectedElement.style.fontSize = `${fontSizeInput.value}px`;
  selectedElement.style.color = colorInput.value;
  selectedElement.style.zIndex = zIndexInput.value;
});
function rgbToHex(rgb) {
  if (!rgb) return "#ffffff";
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  if (!result) return "#ffffff";
  return (
    "#" +
    ("0" + parseInt(result[1]).toString(16)).slice(-2) +
    ("0" + parseInt(result[2]).toString(16)).slice(-2) +
    ("0" + parseInt(result[3]).toString(16)).slice(-2)
  );
}

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

function saveHistory() {
  const snapshot = canvas.innerHTML;
  historyStack.push(snapshot);

  if (historyStack.length > 50) {
    historyStack.shift();
  }
  redoStack = [];
}

function undo() {
  if (historyStack.length === 0) {
    alert("Nothing to undo.");
    return;
  }
  const lastState = historyStack.pop();
  redoStack.push(canvas.innerHTML);
  canvas.innerHTML = lastState;
  reinitializeElements();
}
function redo() {
  if (redoStack.length === 0) {
    alert("Nothing to redo.");
    return;
  }
  const nextState = redoStack.pop();
  historyStack.push(canvas.innerHTML);
  canvas.innerHTML = nextState;
  reinitializeElements();
}

function clearHistory() {
  historyStack = [];
  redoStack = [];
}

saveBtn.addEventListener("click", () => {
  const layout = {
    html: canvas.innerHTML,
    css: uploadedCSS,
    js: uploadedJS
  };
  localStorage.setItem("savedLayout", JSON.stringify(layout));
  alert("Layout saved successfully!");
});

loadBtn.addEventListener("click", () => {
  const savedLayout = localStorage.getItem("savedLayout");
  if (savedLayout) {
    const layout = JSON.parse(savedLayout);
    uploadedHTML = layout.html;
    uploadedCSS = layout.css;
    uploadedJS = layout.js;
    renderContent();
    alert("Layout loaded successfully!");
  } else {
    alert("No saved layout found.");
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".draggable") && !e.target.closest("#stylePanel")) {
    deselectElement();
  }
});

function makeElementEditable(el) {
  if (!el.textContent.trim()) return;

  el.contentEditable = "true";
  el.focus();

  el.classList.add("editing");

  el.addEventListener(
    "blur",
    () => {
      el.contentEditable = "false";
      el.classList.remove("editing");
      saveHistory();
    },
    { once: true }
  );

  el.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
      }
    },
    { once: true }
  );
}

exportBtn.addEventListener("click", () => {
  const elements = canvas.querySelectorAll(".draggable");
  let exportedHTML = "";

  elements.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.classList.remove("draggable");
    const resizeHandle = clone.querySelector(".resize-handle");
    if (resizeHandle) {
      resizeHandle.remove();
    }
    exportedHTML += clone.outerHTML + "\n";
  });

  let fullHTML =
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n';
  fullHTML +=
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  fullHTML += "<title>Exported HTML</title>\n";

  if (uploadedCSS) {
    fullHTML += "<style>\n" + uploadedCSS + "\n</style>\n";
  }

  fullHTML += "</head>\n<body>\n";
  fullHTML += exportedHTML;

  if (uploadedJS) {
    fullHTML += "\n<script>\n" + uploadedJS + "\n</script>\n";
  }

  fullHTML += "</body>\n</html>";

  exportArea.value = fullHTML;
  exportArea.style.display = "block";

  download("exported.html", fullHTML);
});

function download(filename, text) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

canvas.addEventListener("click", (e) => {
  if (e.target === canvas) {
    deselectElement();
  }
});

function populateStylePanel(el) {
  elementIdInput.value = el.id;
  widthInput.value = parseInt(el.style.width) || el.offsetWidth;
  heightInput.value = parseInt(el.style.height) || el.offsetHeight;
  backgroundColorInput.value = rgbToHex(el.style.backgroundColor) || "#ffffff";
  fontSizeInput.value = parseInt(getComputedStyle(el).fontSize) || 16;
  colorInput.value = rgbToHex(getComputedStyle(el).color) || "#000000";
  zIndexInput.value = el.style.zIndex || 1;
}

function clearStylePanel() {
  elementIdInput.value = "";
  widthInput.value = "";
  heightInput.value = "";
  backgroundColorInput.value = "#ffffff";
  fontSizeInput.value = "";
  colorInput.value = "#000000";
  zIndexInput.value = "";
}
function reinitializeElements() {
  const elements = canvas.querySelectorAll(".draggable");
  elements.forEach((el) => {
    makeDraggable(el);
    makeResizable(el);
    addElementEventListeners(el);
  });

  deselectElement();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
});

function initializeElements() {
  const elements = canvas.querySelectorAll(".draggable");
  elements.forEach((el) => {
    makeDraggable(el);
    makeResizable(el);
    addElementEventListeners(el);
  });
}

canvas.addEventListener("dragstart", (e) => {
  e.preventDefault();
});
