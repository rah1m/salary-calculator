/**
 * Azerbaijan Salary Calculator
 * Based on 2026 tax law and current social security contributions
 */

export class SalaryCalculator {
  constructor() {
    // Tax brackets for 2026 (January 1, 2026 - January 1, 2027)
    // Corrected based on user's clarification
    this.taxBrackets = [
      { min: 0, max: 2500, rate: 0.03, fixed: 0 },
      { min: 2500, max: 8000, rate: 0.1, fixed: 0 }, // 10% of amount from 2500 to 8000
      { min: 8000, max: Infinity, rate: 0.14, fixed: 0 }, // 14% of amount above 8000
    ];

    // Social security contributions (current rates)
    this.socialSecurity = {
      dsmf: { rate: 0.1, fixed: 6, threshold: 200 }, // DSMF (State Social Protection Fund)
      unemployment: { rate: 0.005 }, // Unemployment insurance
      medical: { rate: 0.02 }, // Mandatory medical insurance
    };
  }

  /**
   * Calculate income tax based on 2026 tax brackets
   * @param {number} grossSalary - Gross salary amount
   * @returns {number} Income tax amount
   */
  calculateIncomeTax(grossSalary) {
    if (grossSalary <= 0) return 0;

    let totalTax = 0;
    let remainingSalary = grossSalary;

    for (const bracket of this.taxBrackets) {
      if (remainingSalary <= 0) break;

      const taxableAmount = Math.min(
        remainingSalary,
        bracket.max - bracket.min
      );
      if (taxableAmount > 0) {
        if (bracket.min === 0) {
          // First bracket: 3% of amount up to 2500
          totalTax += taxableAmount * bracket.rate;
        } else {
          // Other brackets: percentage of the excess amount only
          totalTax += taxableAmount * bracket.rate;
        }
        remainingSalary -= taxableAmount;
      }
    }

    return Math.round(totalTax * 100) / 100;
  }

  /**
   * Calculate DSMF (State Social Protection Fund) contribution
   * @param {number} grossSalary - Gross salary amount
   * @returns {number} DSMF contribution amount
   */
  calculateDSMF(grossSalary) {
    if (grossSalary <= this.socialSecurity.dsmf.threshold) {
      return 0;
    }
    return (
      this.socialSecurity.dsmf.fixed +
      grossSalary * this.socialSecurity.dsmf.rate
    );
  }

  /**
   * Calculate unemployment insurance contribution
   * @param {number} grossSalary - Gross salary amount
   * @returns {number} Unemployment insurance amount
   */
  calculateUnemploymentInsurance(grossSalary) {
    return grossSalary * this.socialSecurity.unemployment.rate;
  }

  /**
   * Calculate mandatory medical insurance contribution
   * @param {number} grossSalary - Gross salary amount
   * @returns {number} Medical insurance amount
   */
  calculateMedicalInsurance(grossSalary) {
    return grossSalary * this.socialSecurity.medical.rate;
  }

  /**
   * Calculate all social security contributions
   * @param {number} grossSalary - Gross salary amount
   * @returns {object} Object containing all social security contributions
   */
  calculateSocialSecurity(grossSalary) {
    const dsmf = this.calculateDSMF(grossSalary);
    const unemployment = this.calculateUnemploymentInsurance(grossSalary);
    const medical = this.calculateMedicalInsurance(grossSalary);
    const total = dsmf + unemployment + medical;

    return {
      dsmf: Math.round(dsmf * 100) / 100,
      unemployment: Math.round(unemployment * 100) / 100,
      medical: Math.round(medical * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Calculate net salary from gross salary
   * @param {number} grossSalary - Gross salary amount
   * @returns {object} Detailed breakdown of salary calculation
   */
  grossToNet(grossSalary) {
    if (grossSalary <= 0) {
      return {
        grossSalary: 0,
        incomeTax: 0,
        socialSecurity: {
          dsmf: 0,
          unemployment: 0,
          medical: 0,
          total: 0,
        },
        totalDeductions: 0,
        netSalary: 0,
      };
    }

    const incomeTax = this.calculateIncomeTax(grossSalary);
    const socialSecurity = this.calculateSocialSecurity(grossSalary);
    const totalDeductions = incomeTax + socialSecurity.total;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary: Math.round(grossSalary * 100) / 100,
      incomeTax: incomeTax,
      socialSecurity: socialSecurity,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
    };
  }

  /**
   * Calculate gross salary from net salary (reverse calculation)
   * @param {number} netSalary - Net salary amount
   * @returns {object} Detailed breakdown of salary calculation
   */
  netToGross(netSalary) {
    if (netSalary <= 0) {
      return this.grossToNet(0);
    }

    // Use iterative approach to find gross salary
    let grossSalary = netSalary;
    let tolerance = 0.01;
    let maxIterations = 100;
    let iteration = 0;

    while (iteration < maxIterations) {
      const calculation = this.grossToNet(grossSalary);
      const difference = Math.abs(calculation.netSalary - netSalary);

      if (difference < tolerance) {
        break;
      }

      // Adjust gross salary based on the difference
      grossSalary += netSalary - calculation.netSalary;
      iteration++;
    }

    return this.grossToNet(grossSalary);
  }

  /**
   * Get tax bracket information for a given salary
   * @param {number} salary - Salary amount
   * @returns {object} Tax bracket information
   */
  getTaxBracketInfo(salary) {
    for (const bracket of this.taxBrackets) {
      if (salary >= bracket.min && salary < bracket.max) {
        return {
          bracket: bracket,
          description: this.getBracketDescription(bracket),
        };
      }
    }
    return null;
  }

  /**
   * Get human-readable description of tax bracket
   * @param {object} bracket - Tax bracket object
   * @returns {string} Description of the tax bracket
   */
  getBracketDescription(bracket) {
    if (bracket.min === 0) {
      return `Up to ${bracket.max} AZN: ${bracket.rate * 100}% tax`;
    } else if (bracket.max === Infinity) {
      return `Above ${bracket.min} AZN: ${
        bracket.rate * 100
      }% of excess amount`;
    } else {
      return `${bracket.min}-${bracket.max} AZN: ${
        bracket.rate * 100
      }% of amount in this range`;
    }
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("az-AZ", {
      style: "currency",
      currency: "AZN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get detailed breakdown with formatted strings
   * @param {object} calculation - Calculation result object
   * @returns {object} Formatted calculation result
   */
  formatCalculation(calculation) {
    return {
      grossSalary: {
        amount: calculation.grossSalary,
        formatted: this.formatCurrency(calculation.grossSalary),
      },
      incomeTax: {
        amount: calculation.incomeTax,
        formatted: this.formatCurrency(calculation.incomeTax),
      },
      socialSecurity: {
        dsmf: {
          amount: calculation.socialSecurity.dsmf,
          formatted: this.formatCurrency(calculation.socialSecurity.dsmf),
        },
        unemployment: {
          amount: calculation.socialSecurity.unemployment,
          formatted: this.formatCurrency(
            calculation.socialSecurity.unemployment
          ),
        },
        medical: {
          amount: calculation.socialSecurity.medical,
          formatted: this.formatCurrency(calculation.socialSecurity.medical),
        },
        total: {
          amount: calculation.socialSecurity.total,
          formatted: this.formatCurrency(calculation.socialSecurity.total),
        },
      },
      totalDeductions: {
        amount: calculation.totalDeductions,
        formatted: this.formatCurrency(calculation.totalDeductions),
      },
      netSalary: {
        amount: calculation.netSalary,
        formatted: this.formatCurrency(calculation.netSalary),
      },
    };
  }
}
