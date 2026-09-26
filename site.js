(function () {
      function bogotaNow() {
        return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
      }
      function isWeekday(date) {
        var day = date.getDay();
        return day >= 1 && day <= 5;
      }
      function minutes(date) {
        return date.getHours() * 60 + date.getMinutes();
      }
      function isOpen(kind, date) {
        if (kind === "official") return true;
        if (kind === "feed") return true;
        if (kind === "pending") return false;
        if (!isWeekday(date)) return false;
        var m = minutes(date);
        if (kind === "bvc") return m >= 9 * 60 && m <= 16 * 60;
        if (kind === "forex") return true;
        if (kind === "futures") return true;
        return false;
      }
      var now = bogotaNow();
      document.querySelectorAll(".ticker-item").forEach(function (item) {
        var kind = item.getAttribute("data-market");
        var status = item.getAttribute("data-status");
        var open = isOpen(kind, now);
        var state = item.querySelector(".ticker-state");
        var available = status === "ok";
        item.classList.toggle("is-open", open && available);
        item.classList.toggle("is-unavailable", !available);
        if (state) {
          state.textContent = available ? "dato oficial" : "revisar fuente";
        }
        item.title = available ? "Dato oficial trazable" : "Fuente en revision";
      });

      var map = document.querySelector(".col-map[data-departments-src]");
      if (!map || !window.fetch) return;
      fetch(map.getAttribute("data-departments-src"))
        .then(function (response) { return response.ok ? response.json() : null; })
        .then(function (geojson) {
          if (!geojson || !geojson.features) return;
          renderDepartments(map, geojson);
        })
        .catch(function () {});

      function renderDepartments(svg, geojson) {
        var layer = svg.querySelector("#departments-layer");
        if (!layer) return;
        var selectedDepartment = "";
        var bounds = geoBounds(geojson.features);
        var width = 420;
        var height = 520;
        var pad = 34;
        var scale = Math.min((width - pad * 2) / (bounds.maxX - bounds.minX), (height - pad * 2) / (bounds.maxY - bounds.minY));
        var ox = (width - (bounds.maxX - bounds.minX) * scale) / 2;
        var oy = (height - (bounds.maxY - bounds.minY) * scale) / 2;
        function project(point) {
          return [
            ox + (point[0] - bounds.minX) * scale,
            height - (oy + (point[1] - bounds.minY) * scale)
          ];
        }
        geojson.features.forEach(function (feature) {
          var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("class", "department-shape");
          path.setAttribute("tabindex", "0");
          path.setAttribute("role", "button");
          path.setAttribute("d", featurePath(feature.geometry, project));
          var name = feature.properties && feature.properties.shapeName ? feature.properties.shapeName : "Departamento";
          path.setAttribute("aria-label", name + ": datos departamentales en preparacion");
          path.setAttribute("data-department", name);
          var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
          title.textContent = name + ": datos departamentales en preparacion.";
          path.appendChild(title);
          path.addEventListener("mouseenter", function () {
            setDepartmentPanel(name);
            setActiveDepartment(path);
          });
          path.addEventListener("focus", function () {
            setDepartmentPanel(name);
            setActiveDepartment(path);
          });
          path.addEventListener("mouseleave", function () {
            if (selectedDepartment) {
              setDepartmentPanel(selectedDepartment);
              setActiveDepartment(layer.querySelector('[data-department="' + cssEscape(selectedDepartment) + '"]'));
              return;
            }
            clearActiveDepartment();
            resetDepartmentPanel();
          });
          path.addEventListener("click", function () {
            selectedDepartment = name;
            setDepartmentPanel(name);
            setActiveDepartment(path);
          });
          path.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectedDepartment = name;
              setDepartmentPanel(name);
              setActiveDepartment(path);
            }
          });
          layer.appendChild(path);
        });
        svg.classList.add("has-departments");
      }

      function setDepartmentPanel(name) {
        var panel = document.querySelector("[data-department-panel]");
        var title = panel ? panel.querySelector("[data-department-name]") : null;
        var status = panel ? panel.querySelector("[data-department-status]") : null;
        if (title) title.textContent = name;
        if (status) status.textContent = name + ": datos departamentales en preparacion";
        setRegionalCard(name);
      }

      function resetDepartmentPanel() {
        var panel = document.querySelector("[data-department-panel]");
        var title = panel ? panel.querySelector("[data-department-name]") : null;
        var status = panel ? panel.querySelector("[data-department-status]") : null;
        if (title) title.textContent = "Selecciona un departamento";
        if (status) status.textContent = "Hover o click sobre el mapa para ver el nombre del departamento.";
        resetRegionalCard();
      }

      function setRegionalCard(name) {
        var title = document.querySelector("[data-regional-title]");
        var copy = document.querySelector("[data-regional-copy]");
        if (title) title.textContent = name;
        if (copy) copy.textContent = "Aun no publicamos una lectura regional validada para " + name + ". Los indicadores departamentales entran solo cuando existe fuente oficial verificable: sin estimaciones inventadas.";
      }

      function resetRegionalCard() {
        var title = document.querySelector("[data-regional-title]");
        var copy = document.querySelector("[data-regional-copy]");
        if (title) title.textContent = "Selecciona un departamento";
        if (copy) copy.textContent = "Toca o pasa el cursor sobre un departamento del mapa para ver su ficha regional, la region a la que pertenece y que indicadores vienen en camino.";
      }

      function setActiveDepartment(path) {
        clearActiveDepartment();
        if (path) path.classList.add("is-active");
      }

      function clearActiveDepartment() {
        document.querySelectorAll(".department-shape.is-active").forEach(function (item) {
          item.classList.remove("is-active");
        });
      }

      function cssEscape(value) {
        if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
        return String(value).replace(/"/g, "\\"");
      }

      function geoBounds(features) {
        var bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        features.forEach(function (feature) {
          coordinateRings(feature.geometry).forEach(function (ring) {
            ring.forEach(function (point) {
              bounds.minX = Math.min(bounds.minX, point[0]);
              bounds.maxX = Math.max(bounds.maxX, point[0]);
              bounds.minY = Math.min(bounds.minY, point[1]);
              bounds.maxY = Math.max(bounds.maxY, point[1]);
            });
          });
        });
        return bounds;
      }

      function coordinateRings(geometry) {
        if (!geometry) return [];
        if (geometry.type === "Polygon") return geometry.coordinates;
        if (geometry.type === "MultiPolygon") return geometry.coordinates.reduce(function (rings, polygon) {
          return rings.concat(polygon);
        }, []);
        return [];
      }

      function featurePath(geometry, project) {
        return coordinateRings(geometry).map(function (ring) {
          return ring.map(function (point, index) {
            var projected = project(point);
            return (index === 0 ? "M" : "L") + projected[0].toFixed(1) + " " + projected[1].toFixed(1);
          }).join(" ") + " Z";
        }).join(" ");
      }
    })();
