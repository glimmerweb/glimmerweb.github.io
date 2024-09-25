document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const canvas = document.getElementById("canvas");
  const customizationMenu = document.getElementById("customizationMenu");
  const applyChangesButton = document.createElement("button");
  const exportButton = document.getElementById("exportCode");

  applyChangesButton.innerText = "Close";
  customizationMenu.appendChild(applyChangesButton);

  const GRID_SIZE = 20;
  let currentElement = null;
  const pages = [];

  sidebar.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", e.target.dataset.type);
  });

  canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  function addPage(pageName) {
    const newElement = document.createElement("div");
    newElement.className = "draggable-element page-element";
    newElement.innerText = "Page";
    newElement.style.backgroundColor = "#ffffff";
    newElement.style.width = "500px";
    newElement.style.height = "400px";
    newElement.dataset.pageName = pageName;
    canvas.appendChild(newElement);
    pages.push({ name: pageName, element: newElement });
    updateAllNavBars();
  }

  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    let newElement;

    switch (type) {
      case "text":
        newElement = document.createElement("div");
        newElement.className = "draggable-element text-element";
        newElement.contentEditable = true;
        newElement.innerText = "Text";
        break;
      case "colored-square":
        newElement = document.createElement("div");
        newElement.className = "draggable-element colored-square-element";
        newElement.style.width = "100px";
        newElement.style.height = "100px";
        newElement.style.backgroundColor = "#ff7e5f";
        break;
      case "button":
        newElement = document.createElement("button");
        newElement.className = "draggable-element button-element";
        newElement.innerText = "Button";
        break;
      case "video":
        newElement = document.createElement("video");
        newElement.className = "draggable-element video-element";
        newElement.src = "https://example.com/video.mp4";
        newElement.controls = true;
        newElement.style.width = "300px";
        newElement.style.height = "200px";
        break;
      case "audio":
        newElement = document.createElement("audio");
        newElement.className = "draggable-element audio-element";
        newElement.src = "https://example.com/audio.mp3";
        newElement.controls = true;
        newElement.style.width = "300px";
        newElement.style.height = "30px";
        break;
      case "input":
        newElement = document.createElement("input");
        newElement.className = "draggable-element input-field";
        newElement.type = "text";
        newElement.placeholder = "Enter text here...";
        newElement.style.width = "200px";
        newElement.style.height = "30px";
        break;
      case "select":
        newElement = document.createElement("select");
        newElement.className = "draggable-element select-dropdown";
        newElement.innerHTML =
          "<option>Option 1</option><option>Option 2</option>";
        newElement.style.width = "200px";
        newElement.style.height = "30px";
        break;
      case "checkbox":
        newElement = document.createElement("input");
        newElement.type = "checkbox";
        newElement.className = "draggable-element checkbox";
        newElement.checked = false;
        newElement.style.width = "20px";
        newElement.style.height = "20px";
        break;
      case "slider":
        newElement = document.createElement("input");
        newElement.type = "range";
        newElement.min = "0";
        newElement.max = "100";
        newElement.value = "50";
        newElement.className = "draggable-element slider";
        newElement.style.width = "200px";
        newElement.style.height = "10px";
        break;

      case "image":
        newElement = document.createElement("img");
        newElement.className = "draggable-element image-element";
        newElement.src = "https://via.placeholder.com/150";
        newElement.alt = "Image";
        break;
      case "page":
        let pageName = prompt("Enter a unique name for the new page:");
        if (pageName === null) {
          return;
        }
        pageName = pageName.trim();
        if (pageName === "") {
          alert("Page name cannot be empty.");
          return;
        }
        if (pages.some((page) => page.name === pageName)) {
          alert(
            "A page with this name already exists. Please choose a different name."
          );
          return;
        }
        newElement = document.createElement("div");
        newElement.className = "draggable-element page-element";
        newElement.innerText = "Page";
        newElement.style.backgroundColor = "#ffffff";
        newElement.style.width = "500px";
        newElement.style.height = "400px";
        newElement.dataset.pageName = pageName;
        pages.push({ name: pageName, element: newElement });
        updateAllNavBars();
        break;
      case "navbar":
        newElement = document.createElement("div");
        newElement.className = "draggable-element nav-bar";
        newElement.innerHTML = '<nav class="nav-container"></nav>';
        newElement.style.backgroundColor = "#333";
        newElement.style.width = "100%";
        newElement.style.height = "50px";
        newElement.style.display = "flex";
        newElement.style.alignItems = "center";
        newElement.style.justifyContent = "flex-start";
        populateNavBar(newElement);
        break;
      default:
        console.warn(`Unknown element type: ${type}`);
    }

    if (newElement) {
      const rect = canvas.getBoundingClientRect();
      const snapX = Math.floor((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
      const snapY = Math.floor((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;
      let targetPage = null;
      pages.forEach((page) => {
        const pageRect = page.element.getBoundingClientRect();
        if (
          e.clientX >= pageRect.left &&
          e.clientX <= pageRect.right &&
          e.clientY >= pageRect.top &&
          e.clientY <= pageRect.bottom
        ) {
          targetPage = page.element;
        }
      });

      if (targetPage) {
        targetPage.appendChild(newElement);
        newElement.style.position = "absolute";
        newElement.style.left = `${snapX}px`;
        newElement.style.top = `${snapY}px`;
      } else {
        canvas.appendChild(newElement);
        newElement.style.position = "absolute";
        newElement.style.left = `${snapX}px`;
        newElement.style.top = `${snapY}px`;
      }

      makeDraggable(newElement);
      addResizingHandles(newElement);

      if (newElement.classList.contains("nav-bar")) {
        const navButtons = newElement.querySelectorAll(".nav-button");
        navButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const targetPageName = button.dataset.targetPage;
            navigateToPage(targetPageName);
          });
        });
      }
    }
  });

  function onSingleClickElement(e) {
    if (currentElement) {
      currentElement.classList.remove("selected-element");
    }
    currentElement = e.target;
    currentElement.classList.add("selected-element");
    hideAllResizeHandles();
    showResizeHandles(currentElement);
  }

  function onDoubleClickElement(e) {
    currentElement = e.target;
    showCustomizationMenu(currentElement);
  }
  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  function toggleFixedState(element) {
    if (element.classList.contains("fixed-element")) {
      element.classList.remove("fixed-element");
    } else {
      element.classList.add("fixed-element");
    }
  }

  function makeDraggable(element) {
    element.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("resize-handle")) return;
      e.preventDefault();
      if (
        canvas.classList.contains("no-drag") ||
        element.classList.contains("fixed-element")
      )
        return;

      const offsetX = e.clientX - element.getBoundingClientRect().left;
      const offsetY = e.clientY - element.getBoundingClientRect().top;

      function onMouseMove(e) {
        const x = snapToGrid(
          e.clientX - offsetX - canvas.getBoundingClientRect().left
        );
        const y = snapToGrid(
          e.clientY - offsetY - canvas.getBoundingClientRect().top
        );
        element.style.left = `${Math.max(0, x)}px`;
        element.style.top = `${Math.max(0, y)}px`;
        element.style.transform = "none";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    element.addEventListener("click", (e) => {
      if (!e.target.classList.contains("resize-handle")) {
        onSingleClickElement(e);
      }
    });

    element.addEventListener("dblclick", (e) => {
      onDoubleClickElement(e);
    });
  }

  function addResizingHandles(element) {
    const handleSize = 10;
    const positions = ["top-left", "top-right", "bottom-left", "bottom-right"];

    positions.forEach((pos) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${pos}`;
      handle.style.width = `${handleSize}px`;
      handle.style.height = `${handleSize}px`;
      handle.style.position = "absolute";
      handle.style.background = "#000";
      handle.style.cursor = getCursorStyle(pos);
      handle.style.display = "none";
      element.appendChild(handle);

      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.offsetWidth;
        const startHeight = element.offsetHeight;
        const startLeft =
          element.getBoundingClientRect().left -
          canvas.getBoundingClientRect().left;
        const startTop =
          element.getBoundingClientRect().top -
          canvas.getBoundingClientRect().top;

        function onMouseMove(e) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;

          if (pos.includes("right")) {
            newWidth = snapToGrid(startWidth + deltaX);
          } else if (pos.includes("left")) {
            newWidth = snapToGrid(startWidth - deltaX);
            newLeft = snapToGrid(startLeft + deltaX);
          }

          if (pos.includes("bottom")) {
            newHeight = snapToGrid(startHeight + deltaY);
          } else if (pos.includes("top")) {
            newHeight = snapToGrid(startHeight - deltaY);
            newTop = snapToGrid(startTop + deltaY);
          }

          element.style.width = `${Math.max(20, newWidth)}px`;
          element.style.height = `${Math.max(20, newHeight)}px`;
          element.style.left = `${Math.max(0, newLeft)}px`;
          element.style.top = `${Math.max(0, newTop)}px`;
        }

        function onMouseUp() {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    });
  }

  function getCursorStyle(position) {
    const cursors = {
      "top-left": "nw-resize",
      "top-right": "ne-resize",
      "bottom-left": "sw-resize",
      "bottom-right": "se-resize"
    };
    return cursors[position] || "pointer";
  }

  function showCustomizationMenu(element) {
    updateCustomizationMenu(element);
    customizationMenu.style.display = "block";
    sidebar.classList.add("no-drag");
    showResizeHandles(element);
  }

  function hideCustomizationMenu() {
    if (currentElement) {
      currentElement.classList.remove("selected-element");
      hideAllResizeHandles(currentElement);
    }
    customizationMenu.style.display = "none";
    sidebar.classList.remove("no-drag");
    currentElement = null;
  }

  function updateCustomizationMenu(element) {
    if (!element) {
      console.error("No element selected.");
      return;
    }

    customizationMenu.innerHTML = "";
    customizationMenu.appendChild(applyChangesButton);

    const styles = getComputedStyle(element);

    if (element.classList.contains("slider")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="minValue">Minimum Value:</label>
        <input type="number" id="minValue" value="${
          parseInt(element.min, 10) || 0
        }">
      </div>
      
      <div class="menu-section">
        <label for="maxValue">Maximum Value:</label>
        <input type="number" id="maxValue" value="${
          parseInt(element.max, 10) || 100
        }">
      </div>
      
      <div class="menu-section">
        <label for="step">Step Size:</label>
        <input type="number" id="step" value="${
          parseInt(element.step, 10) || 1
        }">
      </div>
      
      <div class="menu-section">
        <label for="value">Current Value:</label>
        <input type="number" id="value" value="${element.value || 50}">
      </div>
      
      <div class="menu-section">
        <label for="orientation">Orientation:</label>
        <select id="orientation">
          <option value="horizontal" ${
            element.orientation === "horizontal" ? "selected" : ""
          }>Horizontal</option>
          <option value="vertical" ${
            element.orientation === "vertical" ? "selected" : ""
          }>Vertical</option>
        </select>
      </div>
    `
      );

      document.getElementById("minValue").addEventListener("input", (e) => {
        element.min = e.target.value;
      });

      document.getElementById("maxValue").addEventListener("input", (e) => {
        element.max = e.target.value;
      });

      document.getElementById("step").addEventListener("input", (e) => {
        element.step = e.target.value;
      });

      document.getElementById("value").addEventListener("input", (e) => {
        element.value = e.target.value;
      });

      document.getElementById("orientation").addEventListener("change", (e) => {
        element.orientation = e.target.value;
      });
    }

    if (element.classList.contains("colored-square-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
    <div class="menu-section">
      <label for="background-type">Background Type:</label>
      <select id="background-type">
        <option value="solid" ${
          element.style.backgroundImage ? "" : "selected"
        }>Solid</option>
        <option value="linear-gradient" ${
          element.style.backgroundImage.includes("linear-gradient")
            ? "selected"
            : ""
        }>Linear Gradient</option>
        <option value="radial-gradient" ${
          element.style.backgroundImage.includes("radial-gradient")
            ? "selected"
            : ""
        }>Radial Gradient</option>
      </select>
    </div>

    <div id="solid-color-section" class="menu-section" ${
      element.style.backgroundImage ? 'style="display:none;"' : ""
    }>
      <label for="background-color">Background Color:</label>
      <input type="color" id="background-color" value="${
        element.style.backgroundColor || "#ff7e5f"
      }">
    </div>

    <div id="gradient-section" class="menu-section" ${
      element.style.backgroundImage ? "" : 'style="display:none;"'
    }>
      <div class="menu-section">
        <label for="gradient-color1">Gradient Color 1:</label>
        <input type="color" id="gradient-color1" value="${
          element.gradientColor1 || "#ff7e5f"
        }">
      </div>
      <div class="menu-section">
        <label for="gradient-color2">Gradient Color 2:</label>
        <input type="color" id="gradient-color2" value="${
          element.gradientColor2 || "#feb47b"
        }">
      </div>

      <div id="linear-gradient-options" class="menu-section" ${
        element.style.backgroundImage.includes("linear-gradient")
          ? ""
          : 'style="display:none;"'
      }>
        <label for="gradient-angle">Gradient Angle (degrees):</label>
        <input type="number" id="gradient-angle" value="${
          element.gradientAngle || 45
        }">
      </div>

      <div id="gradient-position-section" class="menu-section" ${
        element.style.backgroundImage.includes("linear-gradient") &&
        !element.style.backgroundImage.includes("radial-gradient")
          ? ""
          : 'style="display:none;"'
      }>
        <div class="menu-section">
          <label for="color1-position">Color 1 Position (%):</label>
          <input type="number" id="color1-position" value="${
            element.gradientPosition1 || 0
          }">
        </div>
        <div class="menu-section">
          <label for="color2-position">Color 2 Position (%):</label>
          <input type="number" id="color2-position" value="${
            element.gradientPosition2 || 100
          }">
        </div>
      </div>
    </div>

    <div class="menu-section">
      <label for="width">Width (px):</label>
      <input type="number" id="width" value="${
        parseInt(element.style.width, 10) || 100
      }">
    </div>

    <div class="menu-section">
      <label for="height">Height (px):</label>
      <input type="number" id="height" value="${
        parseInt(element.style.height, 10) || 100
      }">
    </div>

    <div class="menu-section">
      <label for="opacity">Opacity:</label>
      <input type="range" id="opacity" min="0" max="1" step="0.1" value="${
        element.style.opacity || 1
      }">
    </div>

    <div class="menu-section">
      <label for="position">Position:</label>
      <select id="position">
        <option value="static" ${
          element.style.position === "static" ? "selected" : ""
        }>Static</option>
        <option value="relative" ${
          element.style.position === "relative" ? "selected" : ""
        }>Relative</option>
        <option value="absolute" ${
          element.style.position === "absolute" ? "selected" : ""
        }>Absolute</option>
        <option value="fixed" ${
          element.style.position === "fixed" ? "selected" : ""
        }>Fixed</option>
        <option value="sticky" ${
          element.style.position === "sticky" ? "selected" : ""
        }>Sticky</option>
      </select>
    </div>

    <div id="position-options" class="menu-section" ${
      element.style.position === "absolute" ||
      element.style.position === "fixed"
        ? ""
        : 'style="display:none;"'
    }>
      <div class="menu-section">
        <label for="top">Top (px):</label>
        <input type="number" id="top" value="${
          element.style.top ? parseInt(element.style.top, 10) : 0
        }">
      </div>
      <div class="menu-section">
        <label for="left">Left (px):</label>
        <input type="number" id="left" value="${
          element.style.left ? parseInt(element.style.left, 10) : 0
        }">
      </div>
    </div>
  `
      );

      // Event listener for background type change
      document
        .getElementById("background-type")
        .addEventListener("change", (e) => {
          const selectedType = e.target.value;
          const solidColorSection = document.getElementById(
            "solid-color-section"
          );
          const gradientSection = document.getElementById("gradient-section");
          const linearGradientOptions = document.getElementById(
            "linear-gradient-options"
          );
          const gradientPositionSection = document.getElementById(
            "gradient-position-section"
          );

          if (selectedType === "solid") {
            element.style.backgroundImage = "";
            solidColorSection.style.display = "block";
            gradientSection.style.display = "none";
          } else {
            solidColorSection.style.display = "none";
            gradientSection.style.display = "block";

            if (selectedType === "linear-gradient") {
              linearGradientOptions.style.display = "block";
              gradientPositionSection.style.display = "block";
              element.style.backgroundImage = `linear-gradient(${
                element.gradientAngle || 45
              }deg, ${element.gradientColor1 || "#ff7e5f"} ${
                element.gradientPosition1 || 0
              }%, ${element.gradientColor2 || "#feb47b"} ${
                element.gradientPosition2 || 100
              }%)`;
            } else {
              linearGradientOptions.style.display = "none";
              gradientPositionSection.style.display = "none";
              element.style.backgroundImage = `radial-gradient(${
                element.gradientColor1 || "#ff7e5f"
              }, ${element.gradientColor2 || "#feb47b"})`;
            }
          }
        });

      // Event listener for solid background color
      document
        .getElementById("background-color")
        .addEventListener("input", (e) => {
          element.style.backgroundColor = e.target.value;
        });

      // Event listeners for gradient color and position changes
      document
        .getElementById("gradient-color1")
        .addEventListener("input", (e) => {
          element.gradientColor1 = e.target.value;
          updateGradient();
        });

      document
        .getElementById("gradient-color2")
        .addEventListener("input", (e) => {
          element.gradientColor2 = e.target.value;
          updateGradient();
        });

      document
        .getElementById("color1-position")
        .addEventListener("input", (e) => {
          element.gradientPosition1 = e.target.value;
          updateGradient();
        });

      document
        .getElementById("color2-position")
        .addEventListener("input", (e) => {
          element.gradientPosition2 = e.target.value;
          updateGradient();
        });

      // Event listener for gradient angle change
      document
        .getElementById("gradient-angle")
        .addEventListener("input", (e) => {
          element.gradientAngle = e.target.value;
          updateGradient();
        });

      // Function to update gradient background
      function updateGradient() {
        const gradientType = document.getElementById("background-type").value;
        if (gradientType === "linear-gradient") {
          element.style.backgroundImage = `linear-gradient(${
            element.gradientAngle || 45
          }deg, ${element.gradientColor1 || "#ff7e5f"} ${
            element.gradientPosition1 || 0
          }%, ${element.gradientColor2 || "#feb47b"} ${
            element.gradientPosition2 || 100
          }%)`;
        } else if (gradientType === "radial-gradient") {
          element.style.backgroundImage = `radial-gradient(${
            element.gradientColor1 || "#ff7e5f"
          }, ${element.gradientColor2 || "#feb47b"})`;
        }
      }

      // Event listeners for width and height changes
      document.getElementById("width").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });

      document.getElementById("height").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });

      // Event listeners for opacity and position changes
      document.getElementById("opacity").addEventListener("input", (e) => {
        element.style.opacity = e.target.value;
      });

      document.getElementById("position").addEventListener("change", (e) => {
        element.style.position = e.target.value;

        const positionOptions = document.getElementById("position-options");
        if (e.target.value === "absolute" || e.target.value === "fixed") {
          positionOptions.style.display = "block";
        } else {
          positionOptions.style.display = "none";
        }
      });

      document.getElementById("top").addEventListener("input", (e) => {
        element.style.top = `${e.target.value}px`;
      });

      document.getElementById("left").addEventListener("input", (e) => {
        element.style.left = `${e.target.value}px`;
      });
    }

    if (element.classList.contains("checkbox")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="checked">Checked:</label>
        <input type="checkbox" id="checked" ${element.checked ? "checked" : ""}>
      </div>
      
      <div class="menu-section">
        <label for="disabled">Disabled:</label>
        <input type="checkbox" id="disabled" ${
          element.disabled ? "checked" : ""
        }>
      </div>
    `
      );

      document.getElementById("checked").addEventListener("change", (e) => {
        element.checked = e.target.checked;
      });

      document.getElementById("disabled").addEventListener("change", (e) => {
        element.disabled = e.target.checked;
      });
    }

    if (element.classList.contains("video-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="src">Source URL:</label>
        <input type="text" id="src" value="${element.src || ""}">
      </div>
      
      <div class="menu-section">
        <label for="width">Width (px):</label>
        <input type="number" id="width" value="${
          parseInt(element.style.width, 10) || 300
        }">
      </div>
      
      <div class="menu-section">
        <label for="height">Height (px):</label>
        <input type="number" id="height" value="${
          parseInt(element.style.height, 10) || 200
        }">
      </div>
      
      <div class="menu-section">
        <label for="controls">Controls:</label>
        <input type="checkbox" id="controls" ${
          element.controls ? "checked" : ""
        }>
      </div>
      
      <div class="menu-section">
        <label for="poster">Poster Image:</label>
        <input type="text" id="poster" value="${
          element.poster ? element.poster : ""
        }">
      </div>
      
      <div class="menu-section">
        <label for="preload">Preload:</label>
        <select id="preload">
          <option value="" ${
            element.preload === "" ? "selected" : ""
          }>None</option>
          <option value="metadata" ${
            element.preload === "metadata" ? "selected" : ""
          }>Metadata</option>
          <option value="auto" ${
            element.preload === "auto" ? "selected" : ""
          }>Auto</option>
        </select>
      </div>
      
      <div class="menu-section">
        <label for="autoplay">Autoplay:</label>
        <input type="checkbox" id="autoplay" ${
          element.autoplay ? "checked" : ""
        }>
      </div>
    `
      );

      document.getElementById("src").addEventListener("change", (e) => {
        element.src = e.target.value;
      });

      document.getElementById("width").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });

      document.getElementById("height").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });

      document.getElementById("controls").addEventListener("change", (e) => {
        element.controls = e.target.checked;
      });

      document.getElementById("poster").addEventListener("change", (e) => {
        element.poster = e.target.value;
      });

      document.getElementById("preload").addEventListener("change", (e) => {
        element.preload = e.target.value;
      });

      document.getElementById("autoplay").addEventListener("change", (e) => {
        element.autoplay = e.target.checked;
      });
    }

    if (element.classList.contains("audio-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="src">Source URL:</label>
        <input type="text" id="src" value="${element.src || ""}">
      </div>
      
      <div class="menu-section">
        <label for="width">Width (px):</label>
        <input type="number" id="width" value="${
          parseInt(element.style.width, 10) || 300
        }">
      </div>
      
      <div class="menu-section">
        <label for="height">Height (px):</label>
        <input type="number" id="height" value="${
          parseInt(element.style.height, 10) || 30
        }">
      </div>
      
      <div class="menu-section">
        <label for="controls">Controls:</label>
        <input type="checkbox" id="controls" ${
          element.controls ? "checked" : ""
        }>
      </div>
      
      <div class="menu-section">
        <label for="preload">Preload:</label>
        <select id="preload">
          <option value="" ${
            element.preload === "" ? "selected" : ""
          }>None</option>
          <option value="metadata" ${
            element.preload === "metadata" ? "selected" : ""
          }>Metadata</option>
          <option value="auto" ${
            element.preload === "auto" ? "selected" : ""
          }>Auto</option>
        </select>
      </div>
      
      <div class="menu-section">
        <label for="autoplay">Autoplay:</label>
        <input type="checkbox" id="autoplay" ${
          element.autoplay ? "checked" : ""
        }>
      </div>
    `
      );

      document.getElementById("src").addEventListener("change", (e) => {
        element.src = e.target.value;
      });

      document.getElementById("width").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });

      document.getElementById("height").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });

      document.getElementById("controls").addEventListener("change", (e) => {
        element.controls = e.target.checked;
      });

      document.getElementById("preload").addEventListener("change", (e) => {
        element.preload = e.target.value;
      });

      document.getElementById("autoplay").addEventListener("change", (e) => {
        element.autoplay = e.target.checked;
      });
    }

    if (element.classList.contains("input-field")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="type">Type:</label>
        <select id="type">
          <option value="text" ${
            element.type === "text" ? "selected" : ""
          }>Text</option>
          <option value="email" ${
            element.type === "email" ? "selected" : ""
          }>Email</option>
          <option value="tel" ${
            element.type === "tel" ? "selected" : ""
          }>Phone</option>
          <option value="password" ${
            element.type === "password" ? "selected" : ""
          }>Password</option>
        </select>
      </div>
      
      <div class="menu-section">
        <label for="placeholder">Placeholder:</label>
        <input type="text" id="placeholder" value="${
          element.placeholder || ""
        }">
      </div>
      
      <div class="menu-section">
        <label for="width">Width (px):</label>
        <input type="number" id="width" value="${
          parseInt(element.style.width, 10) || 200
        }">
      </div>
      
      <div class="menu-section">
        <label for="height">Height (px):</label>
        <input type="number" id="height" value="${
          parseInt(element.style.height, 10) || 30
        }">
      </div>
    `
      );

      document.getElementById("type").addEventListener("change", (e) => {
        element.type = e.target.value;
      });

      document.getElementById("placeholder").addEventListener("input", (e) => {
        element.placeholder = e.target.value;
      });

      document.getElementById("width").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });

      document.getElementById("height").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });
    }

    if (element.classList.contains("select-dropdown")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="options">Options:</label>
        <input type="text" id="optionsInput" value="${Array.from(
          element.options
        )
          .map((option) => option.text)
          .join(",")}">
      </div>
      
      <div class="menu-section">
        <label for="width">Width (px):</label>
        <input type="number" id="width" value="${
          parseInt(element.style.width, 10) || 200
        }">
      </div>
      
      <div class="menu-section">
        <label for="height">Height (px):</label>
        <input type="number" id="height" value="${
          parseInt(element.style.height, 10) || 30
        }">
      </div>
    `
      );

      function addOptionsFromInput(inputValue) {
        const options = inputValue.split(",").map((opt) => opt.trim());

        element.innerHTML = "";

        options.forEach((optionText) => {
          if (optionText !== "") {
            const newOption = document.createElement("option");
            newOption.textContent = optionText;
            element.appendChild(newOption);
          }
        });
        if (!element.value) {
          element.value = options[0] || "";
        }
      }
      document
        .getElementById("optionsInput")
        .addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            addOptionsFromInput(e.target.value);
            e.target.value = "";
          }
        });

      document.getElementById("width").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });

      document.getElementById("height").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });
    }

    if (element.classList.contains("text-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="zIndex">Z-Index:</label>
        <input type="number" id="zIndex" value="${element.style.zIndex || 0}">
      </div>

      <div class="menu-section">
        <label for="textContent">Text Content:</label>
        <textarea id="textContent">${element.innerText}</textarea>
      </div>

      <div class="menu-section">
        <label for="fontSize">Font Size (px):</label>
        <input type="number" id="fontSize" value="${parseInt(
          styles.fontSize,
          10
        )}">
      </div>

      <div class="menu-section">
        <label for="fontColor">Font Color:</label>
        <input type="color" id="fontColor" value="${styles.color}">
      </div>

      <div class="menu-section">
        <label for="fontFamily">Font Family:</label>
        <input type="text" id="fontFamily" value="${styles.fontFamily}">
      </div>

      <div class="menu-section">
        <label for="textAlign">Text Align:</label>
        <select id="textAlign">
          <option value="left" ${
            styles.textAlign === "left" ? "selected" : ""
          }>Left</option>
          <option value="center" ${
            styles.textAlign === "center" ? "selected" : ""
          }>Center</option>
          <option value="right" ${
            styles.textAlign === "right" ? "selected" : ""
          }>Right</option>
        </select>
      </div>

      <div class="menu-section">
        <label for="padding">Padding (px):</label>
        <input type="number" id="padding" value="${parseInt(
          styles.padding,
          10
        )}">
      </div>

      <div class="menu-section">
        <label for="margin">Margin (px):</label>
        <input type="number" id="margin" value="${parseInt(styles.margin, 10)}">
      </div>

      <div class="menu-section">
        <label for="fontWeight">Font Weight:</label>
        <select id="fontWeight">
          <option value="normal" ${
            styles.fontWeight === "normal" ? "selected" : ""
          }>Normal</option>
          <option value="bold" ${
            styles.fontWeight === "bold" ? "selected" : ""
          }>Bold</option>
          <option value="bolder" ${
            styles.fontWeight === "bolder" ? "selected" : ""
          }>Bolder</option>
          <option value="lighter" ${
            styles.fontWeight === "lighter" ? "selected" : ""
          }>Lighter</option>
        </select>
      </div>

      <div class="menu-section">
        <label for="fontStyle">Font Style:</label>
        <select id="fontStyle">
          <option value="normal" ${
            styles.fontStyle === "normal" ? "selected" : ""
          }>Normal</option>
          <option value="italic" ${
            styles.fontStyle === "italic" ? "selected" : ""
          }>Italic</option>
        </select>
      </div>

      <div class="menu-section">
        <label for="textDecoration">Text Decoration:</label>
        <select id="textDecoration">
          <option value="none" ${
            styles.textDecoration === "none" ? "selected" : ""
          }>None</option>
          <option value="underline" ${
            styles.textDecoration === "underline" ? "selected" : ""
          }>Underline</option>
          <option value="line-through" ${
            styles.textDecoration === "line-through" ? "selected" : ""
          }>Line-through</option>
        </select>
      </div>

      <div class="menu-section">
        <label for="lineHeight">Line Height (px):</label>
        <input type="number" id="lineHeight" value="${parseInt(
          styles.lineHeight,
          10
        )}">
      </div>

      <div class="menu-section">
        <label for="letterSpacing">Letter Spacing (px):</label>
        <input type="number" id="letterSpacing" value="${parseInt(
          styles.letterSpacing,
          10
        )}">
      </div>

      <div class="menu-section">
        <label for="textTransform">Text Transform:</label>
        <select id="textTransform">
          <option value="none" ${
            styles.textTransform === "none" ? "selected" : ""
          }>None</option>
          <option value="uppercase" ${
            styles.textTransform === "uppercase" ? "selected" : ""
          }>Uppercase</option>
          <option value="lowercase" ${
            styles.textTransform === "lowercase" ? "selected" : ""
          }>Lowercase</option>
          <option value="capitalize" ${
            styles.textTransform === "capitalize" ? "selected" : ""
          }>Capitalize</option>
        </select>
      </div>

      <div class="menu-section">
        <label for="textShadow">Text Shadow:</label>
        <input type="text" id="textShadow" value="${
          styles.textShadow || "none"
        }">
      </div>

      <div class="menu-section">
        <label for="textOverflow">Text Overflow:</label>
        <select id="textOverflow">
          <option value="clip" ${
            styles.textOverflow === "clip" ? "selected" : ""
          }>Clip</option>
          <option value="ellipsis" ${
            styles.textOverflow === "ellipsis" ? "selected" : ""
          }>Ellipsis</option>
        </select>
      </div>
    `
      );

      document.getElementById("zIndex").addEventListener("input", (e) => {
        element.style.zIndex = e.target.value;
      });

      document.getElementById("textContent").addEventListener("input", (e) => {
        element.innerText = e.target.value;
      });

      document.getElementById("fontSize").addEventListener("input", (e) => {
        element.style.fontSize = `${e.target.value}px`;
      });

      document.getElementById("fontColor").addEventListener("input", (e) => {
        element.style.color = e.target.value;
      });

      document.getElementById("fontFamily").addEventListener("input", (e) => {
        element.style.fontFamily = e.target.value;
      });

      document.getElementById("textAlign").addEventListener("change", (e) => {
        element.style.textAlign = e.target.value;
      });

      document.getElementById("padding").addEventListener("input", (e) => {
        element.style.padding = `${e.target.value}px`;
      });

      document.getElementById("margin").addEventListener("input", (e) => {
        element.style.margin = `${e.target.value}px`;
      });

      document.getElementById("fontWeight").addEventListener("change", (e) => {
        element.style.fontWeight = e.target.value;
      });

      document.getElementById("fontStyle").addEventListener("change", (e) => {
        element.style.fontStyle = e.target.value;
      });

      document
        .getElementById("textDecoration")
        .addEventListener("change", (e) => {
          element.style.textDecoration = e.target.value;
        });

      document.getElementById("lineHeight").addEventListener("input", (e) => {
        element.style.lineHeight = `${e.target.value}px`;
      });

      document
        .getElementById("letterSpacing")
        .addEventListener("input", (e) => {
          element.style.letterSpacing = `${e.target.value}px`;
        });

      document
        .getElementById("textTransform")
        .addEventListener("change", (e) => {
          element.style.textTransform = e.target.value;
        });

      document.getElementById("textShadow").addEventListener("input", (e) => {
        element.style.textShadow = e.target.value;
      });

      document
        .getElementById("textOverflow")
        .addEventListener("change", (e) => {
          element.style.textOverflow = e.target.value;
        });
    }

    if (element.classList.contains("button-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="zIndex">Z-Index:</label>
        <input type="number" id="zIndex" value="${element.style.zIndex || 0}">
      </div>
      <div class="menu-section">
        <label for="buttonText">Button Text:</label>
        <input type="text" id="buttonText" value="${element.innerText}">
      </div>
      <div class="menu-section">
        <label for="buttonColor">Button Background Color:</label>
        <input type="color" id="buttonColor" value="${styles.backgroundColor}">
      </div>
      <div class="menu-section">
        <label for="buttonTextColor">Button Text Color:</label>
        <input type="color" id="buttonTextColor" value="${styles.color}">
      </div>
      <div class="menu-section">
        <label for="buttonPadding">Padding (px):</label>
        <input type="number" id="buttonPadding" value="${parseInt(
          styles.padding,
          10
        )}">
      </div>
      <div class="menu-section">
        <label for="buttonMargin">Margin (px):</label>
        <input type="number" id="buttonMargin" value="${parseInt(
          styles.margin,
          10
        )}">
      </div>
      <div class="menu-section">
        <label for="buttonClickAction">Click Action:</label>
        <select id="buttonClickAction">
          <option value="none" selected>None</option>
          <option value="alert">Show Alert</option>
          <option value="redirect">Redirect to Link</option>
          <option value="showModal">Show Modal</option>
          <option value="logMessage">Log Message</option>
        </select>
      </div>
      <div id="actionSettings" class="menu-section" style="display:none;">
        <div id="modalSettings" style="display:none;">
          <label for="modalText">Modal Text:</label>
          <textarea id="modalText"></textarea>
          <label for="modalBgColor">Modal Background Color:</label>
          <input type="color" id="modalBgColor">
          <label for="modalTextColor">Modal Text Color:</label>
          <input type="color" id="modalTextColor">
        </div>
        <div id="targetElementSection" style="display:none;">
          <label for="targetElement">Target Element:</label>
          <button id="selectTargetBtn">Select Target Element</button>
          <input type="text" id="targetElement" readonly>
        </div>
      </div>
    `
      );

      const actionTypeSelect = document.getElementById("buttonClickAction");
      const actionSettingsDiv = document.getElementById("actionSettings");
      const targetElementInput = document.getElementById("targetElement");
      const targetElementBtn = document.getElementById("selectTargetBtn");

      // Function to update the action options based on selected action type
      function updateActionOptions() {
        const actionType = actionTypeSelect.value;
        document.getElementById("modalSettings").style.display = "none";
        document.getElementById("targetElementSection").style.display = "none";

        switch (actionType) {
          case "showModal":
            document.getElementById("modalSettings").style.display = "block";
            actionSettingsDiv.style.display = "block";
            break;

          case "alert":
          case "redirect":
          case "logMessage":
            actionSettingsDiv.style.display = "none";
            break;

          default:
            actionSettingsDiv.style.display = "none";
            break;
        }
      }

      function handleButtonClick() {
        const actionType = actionTypeSelect.value;
        const targetElementId = targetElementInput.value;
        const targetElement = document.getElementById(targetElementId);
        const customJsCode = element.getAttribute("data-custom-js");

        switch (actionType) {
          case "alert":
            alert("Button Clicked!");
            break;

          case "redirect":
            const link = prompt("Enter URL:");
            if (link) window.location.href = link;
            break;

          case "showModal":
            const modalText = document.getElementById("modalText").value;
            const modalBgColor = document.getElementById("modalBgColor").value;
            const modalTextColor = document.getElementById("modalTextColor")
              .value;

            const modal = document.createElement("div");
            modal.style.position = "fixed";
            modal.style.top = "50%";
            modal.style.left = "50%";
            modal.style.transform = "translate(-50%, -50%)";
            modal.style.padding = "20px";
            modal.style.backgroundColor = modalBgColor || "#fff";
            modal.style.color = modalTextColor || "#000";
            modal.style.border = "1px solid #ccc";
            modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
            modal.innerHTML = `<p>${
              modalText || "This is a modal popup!"
            }</p><button id="closeModal">Close</button>`;
            document.body.appendChild(modal);
            document
              .getElementById("closeModal")
              .addEventListener("click", () => {
                document.body.removeChild(modal);
              });
            break;

          case "logMessage":
            const message = prompt("Enter message to log:");
            if (message) console.log(message);
            break;

          case "none":
          default:
            if (customJsCode) {
              // Evaluate and execute the custom JavaScript code stored in data-custom-js
              try {
                new Function(customJsCode).call(element);
              } catch (error) {
                console.error("Error executing custom JavaScript:", error);
              }
            }
            break;
        }
      }

      // Event listeners
      document.getElementById("zIndex").addEventListener("input", (e) => {
        element.style.zIndex = e.target.value;
      });

      document.getElementById("buttonText").addEventListener("input", (e) => {
        element.innerText = e.target.value;
      });

      document.getElementById("buttonColor").addEventListener("input", (e) => {
        element.style.backgroundColor = e.target.value;
      });

      document
        .getElementById("buttonTextColor")
        .addEventListener("input", (e) => {
          element.style.color = e.target.value;
        });

      document
        .getElementById("buttonPadding")
        .addEventListener("input", (e) => {
          element.style.padding = `${e.target.value}px`;
        });

      document.getElementById("buttonMargin").addEventListener("input", (e) => {
        element.style.margin = `${e.target.value}px`;
      });

      actionTypeSelect.addEventListener("change", updateActionOptions);

      // Add event listener for selecting target element
      targetElementBtn.addEventListener("click", () => {
        // Code to enable selecting another element as target
        document.addEventListener("click", function selectTarget(event) {
          if (event.target !== element && event.target !== targetElementBtn) {
            targetElementInput.value = event.target.id;
            document.removeEventListener("click", selectTarget);
          }
        });
      });

      // Initialize action settings
      updateActionOptions();

      // Event listeners
      document.getElementById("zIndex").addEventListener("input", (e) => {
        element.style.zIndex = e.target.value;
      });

      document.getElementById("buttonText").addEventListener("input", (e) => {
        element.innerText = e.target.value;
      });

      document.getElementById("buttonColor").addEventListener("input", (e) => {
        element.style.backgroundColor = e.target.value;
      });

      document
        .getElementById("buttonTextColor")
        .addEventListener("input", (e) => {
          element.style.color = e.target.value;
        });

      document
        .getElementById("buttonPadding")
        .addEventListener("input", (e) => {
          element.style.padding = `${e.target.value}px`;
        });

      document.getElementById("buttonMargin").addEventListener("input", (e) => {
        element.style.margin = `${e.target.value}px`;
      });

      actionTypeSelect.addEventListener("change", updateActionOptions);

      // Add event listener for selecting target element
      targetElementBtn.addEventListener("click", () => {
        // Code to enable selecting another element as target
        document.addEventListener("click", function selectTarget(event) {
          if (event.target !== element && event.target !== targetElementBtn) {
            targetElementInput.value = event.target.id;
            document.removeEventListener("click", selectTarget);
          }
        });
      });

      // Initialize action settings
      updateActionOptions();
    }

    if (element.classList.contains("image-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
                        <div class="menu-section">
    <label for="zIndex">Z-Index:</label>
    <input type="number" id="zIndex" value="${element.style.zIndex || 0}">
</div>
                <div class="menu-section">
                    <label for="imageWidth">Width (px):</label>
                    <input type="number" id="imageWidth" value="${parseInt(
                      styles.width,
                      10
                    )}">
                </div>
                <div class="menu-section">
                    <label for="imageHeight">Height (px):</label>
                    <input type="number" id="imageHeight" value="${parseInt(
                      styles.height,
                      10
                    )}">
                </div>
                <div class="menu-section">
                    <label for="imageSrc">Image Source URL:</label>
                    <input type="text" id="imageSrc" value="${element.src}">
                </div>
            `
      );
      document.getElementById("zIndex").addEventListener("input", (e) => {
        element.style.zIndex = e.target.value;
      });
      document.getElementById("imageWidth").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });
      document.getElementById("imageHeight").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });
      document.getElementById("imageSrc").addEventListener("input", (e) => {
        element.src = e.target.value;
      });
    }

    if (element.classList.contains("page-element")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
                <div class="menu-section">
                    <label for="pageBgColor">Background Color:</label>
                    <input type="color" id="pageBgColor" value="${
                      styles.backgroundColor
                    }">
                </div>
                <div class="menu-section">
                    <label for="pageWidth">Width (px):</label>
                    <input type="number" id="pageWidth" value="${parseInt(
                      styles.width,
                      10
                    )}">
                </div>
                <div class="menu-section">
                    <label for="pageHeight">Height (px):</label>
                    <input type="number" id="pageHeight" value="${parseInt(
                      styles.height,
                      10
                    )}">
                </div>
                <div class="menu-section">
                    <label for="pageBorder">Border:</label>
                    <input type="text" id="pageBorder" placeholder="e.g., 1px solid #000" value="${
                      styles.border
                    }">
                </div>
                <div class="menu-section">
                    <label for="pageName">Page Name:</label>
                    <input type="text" id="pageName" value="${
                      element.dataset.pageName
                    }" readonly>
                </div>
            `
      );
      document.getElementById("pageBgColor").addEventListener("input", (e) => {
        element.style.backgroundColor = e.target.value;
      });
      document.getElementById("pageWidth").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });
      document.getElementById("pageHeight").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });
      document.getElementById("pageBorder").addEventListener("input", (e) => {
        element.style.border = e.target.value;
      });
    }

    if (element.classList.contains("nav-bar")) {
      customizationMenu.insertAdjacentHTML(
        "beforeend",
        `
      <div class="menu-section">
        <label for="textContent">Text Content:</label>
        <textarea id="textContent">${element.innerText}</textarea>
      </div>
      <div class="menu-section">
        <label for="navBgColor">Background Color:</label>
        <input type="color" id="navBgColor" value="${styles.backgroundColor}">
      </div>
      <div class="menu-section">
        <label for="navWidth">Width (px):</label>
        <input type="number" id="navWidth" value="${parseInt(
          styles.width,
          10
        )}">
      </div>
      <div class="menu-section">
        <label for="navHeight">Height (px):</label>
        <input type="number" id="navHeight" value="${parseInt(
          styles.height,
          10
        )}">
      </div>
      <div class="menu-section">
        <label for="navPadding">Padding (px):</label>
        <input type="number" id="navPadding" value="${parseInt(
          styles.padding,
          10
        )}">
      </div>
      <div class="menu-section">
        <label for="navMargin">Margin (px):</label>
        <input type="number" id="navMargin" value="${parseInt(
          styles.margin,
          10
        )}">
      </div>
      <div class="menu-section">
        <label for="buttonBgColor">Button Background Color:</label>
        <input type="color" id="buttonBgColor" value="#555">
      </div>
      <div class="menu-section">
        <label for="buttonTextColor">Button Text Color:</label>
        <input type="color" id="buttonTextColor" value="#fff">
      </div>
      <div class="menu-section">
        <label for="buttonBorderRadius">Button Border Radius (px):</label>
        <input type="number" id="buttonBorderRadius" value="3">
      </div>
    `
      );

      document.getElementById("navBgColor").addEventListener("input", (e) => {
        element.style.backgroundColor = e.target.value;
      });
      document.getElementById("navWidth").addEventListener("input", (e) => {
        element.style.width = `${e.target.value}px`;
      });
      document.getElementById("navHeight").addEventListener("input", (e) => {
        element.style.height = `${e.target.value}px`;
      });
      document.getElementById("navPadding").addEventListener("input", (e) => {
        element.style.padding = `${e.target.value}px`;
      });
      document.getElementById("navMargin").addEventListener("input", (e) => {
        element.style.margin = `${e.target.value}px`;
      });

      document.getElementById("buttonBgColor").addEventListener("input", (e) => {
  const buttons = element.querySelectorAll(".nav-button-custom");
buttons.forEach((button) => {
  button.style.setProperty('background-color', e.target.value, 'important');
});
});
      document
        .getElementById("buttonTextColor")
        .addEventListener("input", (e) => {
          const buttons = element.querySelectorAll(".nav-button-custom");
          buttons.forEach((button) => {
            button.style.color = e.target.value;
          });
        });

      document
        .getElementById("buttonBorderRadius")
        .addEventListener("input", (e) => {
          const buttons = element.querySelectorAll(".nav-button-custom");
          buttons.forEach((button) => {
            button.style.borderRadius = `${e.target.value}px`;
          });
        });
    }
  }

  function populateNavBar(navBarElement) {
    const navContainer = navBarElement.querySelector(".nav-container");
    navContainer.innerHTML = "";

    pages.forEach((page) => {
      const button = document.createElement("button");
      button.className = "nav-button-custom"; // Custom class for nav bar buttons
      button.innerText = page.name;
      button.dataset.targetPage = page.name;
      button.style.margin = "0 5px";
      button.style.padding = "5px 10px";
      button.style.cursor = "pointer";
      button.style.backgroundColor = "#555"; // Default styles
      button.style.color = "#fff";
      button.style.border = "none";
      button.style.borderRadius = "3px";
      button.addEventListener("click", () => {
        navigateToPage(page.name);
      });

      navContainer.appendChild(button);
    });
  }

  function updateAllNavBars() {
    const navBars = canvas.querySelectorAll(".nav-bar");
    navBars.forEach((navBar) => {
      populateNavBar(navBar);
    });
  }

  function navigateToPage(pageName) {
    pages.forEach((page) => {
      if (page.name === pageName) {
        page.element.style.display = "block";
        Array.from(page.element.children).forEach((child) => {
          child.style.display = "block";
        });
      } else {
        page.element.style.display = "none";
        Array.from(page.element.children).forEach((child) => {
          child.style.display = "none";
        });
      }
    });
  }
  function hideAllResizeHandles() {
    const handles = document.querySelectorAll(".resize-handle");
    handles.forEach((handle) => (handle.style.display = "none"));
  }
  function showResizeHandles(element) {
    const handles = element.querySelectorAll(".resize-handle");
    handles.forEach((handle) => (handle.style.display = "block"));
  }

  applyChangesButton.addEventListener("click", () => {
    hideCustomizationMenu();
  });

  function onDoubleClickOrKeyAction(e) {
    onDoubleClickElement(e);
  }

  //ALL OF THE KEYBINDS
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideCustomizationMenu();
    } else if (e.key === "Backspace" && currentElement && e.shiftKey) {
      canvas.removeChild(currentElement);
      hideCustomizationMenu();

      if (currentElement.classList.contains("page-element")) {
        const pageName = currentElement.dataset.pageName;
        const pageIndex = pages.findIndex((page) => page.name === pageName);
        if (pageIndex !== -1) {
          pages.splice(pageIndex, 1);
        }
      }
    } else if (currentElement && e.key === "f") {
      toggleFixedState(currentElement);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      exportCode();
    }
  });

  canvas.addEventListener("click", (e) => {
    if (e.target.classList.contains("draggable-element")) {
      onSingleClickElement(e);
    }
  });
  let selectedElement = null;

  function handleElementAction(element) {
    if (element && element.classList.contains("draggable-element")) {
      const doubleClickEvent = new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(doubleClickEvent);
    }
  }
  canvas.addEventListener("click", (e) => {
    if (e.target.classList.contains("draggable-element")) {
      selectedElement = e.target;
      onSingleClickElement(e);
    } else {
      selectedElement = null;
    }
  });

  canvas.addEventListener("dblclick", (e) => {
    handleElementAction(e.target);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "e") {
      handleElementAction(selectedElement);
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !customizationMenu.contains(e.target) &&
      !e.target.classList.contains("draggable-element")
    ) {
      hideCustomizationMenu();
    }
  });
});
