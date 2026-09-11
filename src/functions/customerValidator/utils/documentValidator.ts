function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

export function isValidCpf(rawCpf: string): boolean {
  const cpf = onlyDigits(rawCpf);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (base: string): number => {
    let sum = 0;
    let weight = base.length + 1;

    for (const digit of base) {
      sum += parseInt(digit, 10) * weight;
      weight--;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstNineDigits = cpf.substring(0, 9);
  const firstDigit = calculateDigit(firstNineDigits);

  const firstTenDigits = firstNineDigits + firstDigit;
  const secondDigit = calculateDigit(firstTenDigits);

  return cpf === firstTenDigits + secondDigit;
}

export function isValidCnpj(rawCnpj: string): boolean {
  const cnpj = onlyDigits(rawCnpj);

  if (cnpj.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calculateDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstTwelveDigits = cnpj.substring(0, 12);
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstDigit = calculateDigit(firstTwelveDigits, firstWeights);

  const firstThirteenDigits = firstTwelveDigits + firstDigit;
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondDigit = calculateDigit(firstThirteenDigits, secondWeights);

  return cnpj === firstThirteenDigits + secondDigit;
}

export function normalizeDocument(rawDocument: string): string {
  return onlyDigits(rawDocument);
}