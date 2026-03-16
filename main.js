function setLastUpdated(text) {
  const el = document.getElementById("last-updated");
  if (el) {
    el.textContent = "Last updated: " + text;
  }
}

// Position sizing calculator
function setupPositionCalculator() {
  const button = document.getElementById("calcButton");
  const resultEl = document.getElementById("position-result");

  if (!button || !resultEl) return;

  button.addEventListener("click", () => {
    const accountSize = parseFloat(
      document.getElementById("accountSize").value
    );
    const riskPercent = parseFloat(
      document.getElementById("riskPercent").value
    );
    const entryPrice = parseFloat(
      document.getElementById("entryPrice").value
    );
    const stopPrice = parseFloat(
      document.getElementById("stopPrice").value
    );

    if (
      !accountSize ||
      !riskPercent ||
      !entryPrice ||
      !stopPrice ||
      stopPrice === entryPrice
    ) {
      resultEl.innerHTML =
        "<span style='color:#f97373'>請填好所有欄位，且停損價不能等於入場價。</span>";
      return;
    }

    const riskAmount = (accountSize * riskPercent) / 100.0;
    const perShareRisk = Math.abs(entryPrice - stopPrice);
    const positionSize = Math.floor(riskAmount / perShareRisk);

    // 假設 1R = entry - stop，給三個簡單的分批出場價格
    const r1 = entryPrice + (entryPrice - stopPrice);
    const r2 = entryPrice + 2 * (entryPrice - stopPrice);
    const r3 = entryPrice + 3 * (entryPrice - stopPrice);

    resultEl.innerHTML = `
      <div><strong>Risk amount:</strong> ${riskAmount.toFixed(2)}</div>
      <div><strong>Position size:</strong> ${positionSize} shares</div>
      <div style="margin-top:6px;"><strong>Sample take-profit levels:</strong></div>
      <ul>
        <li>1R: ${r1.toFixed(2)}</li>
        <li>2R: ${r2.toFixed(2)}</li>
        <li>3R: ${r3.toFixed(2)}</li>
      </ul>
    `;
  });
}

// 從 JSON 產生 table HTML
function renderTableFromJson(containerId, jsonData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!jsonData || !jsonData.columns || !jsonData.rows) {
    container.innerHTML =
      "<span class='placeholder'>No data.</span>";
    return;
  }

  const { columns, rows } = jsonData;

  let html = "<table class='table'><thead><tr>";
  for (const col of columns) {
    html += `<th>${col}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (const row of rows) {
    html += "<tr>";
    for (const col of columns) {
      const value = row[col];
      html += `<td>${value !== undefined ? value : ""}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table>";
  container.innerHTML = html;
}

// 載入 data/*.json（給之後 Python 工作流更新）
async function loadData() {
  try {
    const [macroRes, equitiesRes, metaRes] = await Promise.all([
      fetch("data/macro.json"),
      fetch("data/equities.json"),
      fetch("data/meta.json"),
    ]);

    if (macroRes.ok) {
      const macroJson = await macroRes.json();
      renderTableFromJson("macro-table", macroJson);
    }

    if (equitiesRes.ok) {
      const equitiesJson = await equitiesRes.json();
      renderTableFromJson("equities-table", equitiesJson);
    }

    if (metaRes.ok) {
      const meta = await metaRes.json();
      if (meta.last_updated_hkt) {
        setLastUpdated(meta.last_updated_hkt);
      }
    }
  } catch (e) {
    console.error("Error loading data", e);
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  setupPositionCalculator();
  loadData();
});