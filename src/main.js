import "./style.css";
import { SalaryCalculator } from "./salaryCalculator.js";

class SalaryCalculatorApp {
  constructor() {
    this.calculator = new SalaryCalculator();
    this.currentMode = "gross-to-net";
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    document.querySelector("#app").innerHTML = `
      <div class="container">
        <header class="header">
          <h1>🇦🇿 Azərbaycan Əməkhaqqı Kalkulyatoru</h1>
          <p class="subtitle">2026-cı il vergi qanununa əsasən</p>
        </header>

        <div class="calculator-container">
          <div class="mode-selector">
            <button id="gross-to-net-btn" class="mode-btn active">Gross → Net</button>
            <button id="net-to-gross-btn" class="mode-btn">Net → Gross</button>
          </div>

          <div class="input-section">
            <div class="input-group">
              <label for="salary-input" id="salary-label">Brüt əməkhaqqı (AZN)</label>
              <input 
                type="number" 
                id="salary-input" 
                placeholder="Məbləği daxil edin"
                min="0"
                step="0.01"
              />
            </div>
            <button id="calculate-btn" class="calculate-btn">Hesabla</button>
          </div>

          <div id="results" class="results-section" style="display: none;">
            <div class="results-header">
              <h3 id="results-title">Hesablama Nəticələri</h3>
            </div>
            
            <div class="results-grid">
              <div class="result-card main-result">
                <div class="result-label" id="main-result-label">Xalis əməkhaqqı</div>
                <div class="result-value" id="main-result-value">0.00 AZN</div>
              </div>

              <div class="result-card">
                <div class="result-label">Brüt əməkhaqqı</div>
                <div class="result-value" id="gross-salary">0.00 AZN</div>
              </div>

              <div class="result-card deduction">
                <div class="result-label">Gəlir vergisi</div>
                <div class="result-value" id="income-tax">0.00 AZN</div>
              </div>

              <div class="result-card deduction">
                <div class="result-label">DSMF ayırması</div>
                <div class="result-value" id="dsmf">0.00 AZN</div>
              </div>

              <div class="result-card deduction">
                <div class="result-label">İşsizlikdən sığorta</div>
                <div class="result-value" id="unemployment">0.00 AZN</div>
              </div>

              <div class="result-card deduction">
                <div class="result-label">İcbari tibbi sığorta</div>
                <div class="result-value" id="medical">0.00 AZN</div>
              </div>

              <div class="result-card total-deduction">
                <div class="result-label">Ümumi ayırmalar</div>
                <div class="result-value" id="total-deductions">0.00 AZN</div>
              </div>
            </div>

            <div class="tax-info" id="tax-info" style="display: none;">
              <h4>Vergi Məlumatları</h4>
              <p id="tax-bracket-info"></p>
            </div>
          </div>

          <div class="info-section">
            <h3>Vergi Dərəcələri (2026)</h3>
            <div class="tax-brackets">
              <div class="bracket">
                <span class="bracket-range">0 - 2,500 AZN</span>
                <span class="bracket-rate">3%</span>
              </div>
              <div class="bracket">
                <span class="bracket-range">2,500 - 8,000 AZN</span>
                <span class="bracket-rate">10% (məbləğin 2500-8000 arası hissəsi)</span>
              </div>
              <div class="bracket">
                <span class="bracket-range">8,000+ AZN</span>
                <span class="bracket-rate">14% (8000-dan yuxarı məbləğ)</span>
              </div>
            </div>

            <h3>Sosial Təminat Ayırmaları</h3>
            <div class="social-security">
              <div class="contribution">
                <span class="contribution-name">DSMF</span>
                <span class="contribution-rate">6 AZN + 10% (200 AZN-dan yuxarı)</span>
              </div>
              <div class="contribution">
                <span class="contribution-name">İşsizlikdən sığorta</span>
                <span class="contribution-rate">0.5%</span>
              </div>
              <div class="contribution">
                <span class="contribution-name">İcbari tibbi sığorta</span>
                <span class="contribution-rate">2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Mode switching
    document
      .getElementById("gross-to-net-btn")
      .addEventListener("click", () => {
        this.switchMode("gross-to-net");
      });

    document
      .getElementById("net-to-gross-btn")
      .addEventListener("click", () => {
        this.switchMode("net-to-gross");
      });

    // Calculate button
    document.getElementById("calculate-btn").addEventListener("click", () => {
      this.calculate();
    });

    // Enter key support
    document
      .getElementById("salary-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.calculate();
        }
      });

    // Real-time calculation on input change
    document.getElementById("salary-input").addEventListener("input", () => {
      this.calculate();
    });
  }

  switchMode(mode) {
    this.currentMode = mode;

    // Update button states
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    if (mode === "gross-to-net") {
      document.getElementById("gross-to-net-btn").classList.add("active");
      document.getElementById("salary-label").textContent =
        "Gross salary (AZN)";
      document.getElementById("main-result-label").textContent = "Net salary";
    } else {
      document.getElementById("net-to-gross-btn").classList.add("active");
      document.getElementById("salary-label").textContent = "Net salary (AZN)";
      document.getElementById("main-result-label").textContent = "Gross salary";
    }

    // Clear results and recalculate if there's input
    const input = document.getElementById("salary-input");
    if (input.value) {
      this.calculate();
    }
  }

  calculate() {
    const input = document.getElementById("salary-input");
    const salary = parseFloat(input.value);

    if (!salary || salary <= 0) {
      document.getElementById("results").style.display = "none";
      return;
    }

    let calculation;
    if (this.currentMode === "gross-to-net") {
      calculation = this.calculator.grossToNet(salary);
    } else {
      calculation = this.calculator.netToGross(salary);
    }

    this.displayResults(calculation);
  }

  displayResults(calculation) {
    const formatted = this.calculator.formatCalculation(calculation);

    // Update main result
    if (this.currentMode === "gross-to-net") {
      document.getElementById("main-result-value").textContent =
        formatted.netSalary.formatted;
    } else {
      document.getElementById("main-result-value").textContent =
        formatted.grossSalary.formatted;
    }

    // Update all values
    document.getElementById("gross-salary").textContent =
      formatted.grossSalary.formatted;
    document.getElementById("income-tax").textContent =
      formatted.incomeTax.formatted;
    document.getElementById("dsmf").textContent =
      formatted.socialSecurity.dsmf.formatted;
    document.getElementById("unemployment").textContent =
      formatted.socialSecurity.unemployment.formatted;
    document.getElementById("medical").textContent =
      formatted.socialSecurity.medical.formatted;
    document.getElementById("total-deductions").textContent =
      formatted.totalDeductions.formatted;

    // Show tax bracket info
    const taxBracketInfo = this.calculator.getTaxBracketInfo(
      calculation.grossSalary
    );
    if (taxBracketInfo) {
      document.getElementById("tax-bracket-info").textContent =
        taxBracketInfo.description;
      document.getElementById("tax-info").style.display = "block";
    } else {
      document.getElementById("tax-info").style.display = "none";
    }

    // Show results
    document.getElementById("results").style.display = "block";
  }
}

// Initialize the app
new SalaryCalculatorApp();
