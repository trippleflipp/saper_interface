import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordStrengthService {
  private readonly KEYBOARD_PATTERNS = [
    // Горизонтальные ряды QWERTY
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    // Диагональные паттерны
    'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ikm',
    // Обратные паттерны
    'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
    // Частичные паттерны
    'qwerty', 'asdfgh', 'zxcvb'
  ];

  private readonly COMMON_SUBSTITUTIONS = {
    'a': ['@', '4'],
    'b': ['8'],
    'e': ['3'],
    'i': ['1', '!'],
    'l': ['1', '|'],
    'o': ['0'],
    's': ['$', '5'],
    't': ['+', '7'],
    'z': ['2']
  };

  private readonly COMMON_PASSWORDS = [
    'password', 'qwerty', '123456', 'admin', 'welcome',
    'login', 'master', 'hello', 'monkey', 'dragon',
    'letmein', 'baseball', 'football', 'shadow', 'michael',
    'ninja', 'mustang', 'hockey', 'superman', 'jordan',
    '12345678', 'abc123', '111111', 'password1', 'qwerty123'
  ];

  calculateStrength(password: string, email?: string, username?: string): { strength: number; label: string; color: string } {
    if (!password) {
      return { strength: 0, label: 'Пустой', color: '#757575' };
    }

    // Проверяем длину пароля перед всеми остальными проверками
    if (password.length < 8) {
      return { strength: 0, label: 'Слишком короткий', color: '#757575' };
    }

    let entropy = 0;
    let weaknesses = 0;
    
    // Базовая энтропия на основе длины и использованных символов
    entropy += this.calculateBaseEntropy(password);
    
    // Уменьшение энтропии за найденные слабости
    weaknesses += this.checkForWeaknesses(password);
    
    // Проверка на схожесть с email
    if (email && this.containsEmail(password, email)) {
      weaknesses += 3;
    }

    // Нормализация финального значения с минимальным порогом
    let finalStrength = Math.max(5, Math.min(100, entropy - (weaknesses * 15)));

    // Если пароль содержит серьезные слабости, ограничиваем максимальную оценку
    if (weaknesses >= 2) {
      finalStrength = Math.min(finalStrength, 25); // Ограничиваем до "Слабый"
    }

    return this.getStrengthLabel(finalStrength);
  }

  private calculateBaseEntropy(password: string): number {
    let entropy = 0;
    
    // Базовые характеристики (уменьшаем вес длины)
    entropy += Math.min(password.length * 2, 30); // Ограничиваем максимальный бонус за длину
    entropy += Math.min(this.countUniqueChars(password) * 2, 20); // Ограничиваем бонус за уникальные символы
    
    // Бонусы за разные типы символов и их распределение
    const charTypes = this.analyzeCharacterDistribution(password);
    
    // Бонусы за хорошее распределение символов
    if (charTypes.upperCount > 1) entropy += 8;
    if (charTypes.lowerCount > 2) entropy += 8;
    if (charTypes.digitCount > 1) entropy += 8;
    if (charTypes.specialCount > 1) entropy += 12;
    
    // Бонус за разнообразие символов
    const typesCount = [
      charTypes.hasUpper,
      charTypes.hasLower,
      charTypes.hasDigit,
      charTypes.hasSpecial
    ].filter(Boolean).length;

    // Оценка распределения символов
    const distribution = this.evaluateDistribution(charTypes);
    if (typesCount >= 3 && distribution >= 0.3) {
      entropy += 15;
    }
    
    // Бонус за оптимальную длину (12-16 символов)
    if (password.length >= 12 && password.length <= 16) {
      entropy += 10;
    }

    return entropy;
  }

  private analyzeCharacterDistribution(password: string): {
    hasUpper: boolean;
    hasLower: boolean;
    hasDigit: boolean;
    hasSpecial: boolean;
    upperCount: number;
    lowerCount: number;
    digitCount: number;
    specialCount: number;
  } {
    return {
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      upperCount: (password.match(/[A-Z]/g) || []).length,
      lowerCount: (password.match(/[a-z]/g) || []).length,
      digitCount: (password.match(/[0-9]/g) || []).length,
      specialCount: (password.match(/[^A-Za-z0-9]/g) || []).length
    };
  }

  private evaluateDistribution(charTypes: any): number {
    const total = charTypes.upperCount + charTypes.lowerCount + 
                 charTypes.digitCount + charTypes.specialCount;
    
    if (total === 0) return 0;

    const proportions = [
      charTypes.upperCount / total,
      charTypes.lowerCount / total,
      charTypes.digitCount / total,
      charTypes.specialCount / total
    ].filter(p => p > 0);

    // Вычисляем стандартное отклонение пропорций
    const mean = 1 / proportions.length;
    const variance = proportions.reduce((acc, p) => 
      acc + Math.pow(p - mean, 2), 0) / proportions.length;
    
    // Возвращаем оценку равномерности распределения (1 - станд. отклонение)
    return 1 - Math.sqrt(variance);
  }

  private checkForWeaknesses(password: string): number {
    let weaknesses = 0;
    const lowerPassword = password.toLowerCase();

    // Проверка на общие пароли
    if (this.COMMON_PASSWORDS.some(commonPass => 
        lowerPassword.includes(commonPass))) {
      weaknesses += 4;
    }

    // Проверка на повторяющиеся символы
    if (/(.)\1{2,}/.test(password)) {
      weaknesses += 3;
    }

    // Проверка на последовательности цифр
    if (this.hasSequentialDigits(password)) {
      weaknesses += 3;
    }

    // Проверка на простые числовые паттерны
    if (/^\d+$/.test(password)) {  // только цифры
      weaknesses += 4;
    }

    // Проверка на чередующиеся цифры
    if (/^(?:(\d)(?!\1))+$/.test(password)) {  // чередующиеся цифры (например, 121212)
      weaknesses += 3;
    }

    // Проверка на клавиатурные паттерны
    if (this.hasKeyboardPattern(lowerPassword)) {
      weaknesses += 3;
    }

    // Проверка на чередование букв и цифр
    if (/^(?:[a-zA-Z]\d)+[a-zA-Z]?$|^(?:\d[a-zA-Z])+\d?$/.test(password)) {
      weaknesses += 2;
    }

    // Проверка на простые замены символов
    if (this.hasCommonSubstitutions(password)) {
      weaknesses += 2;
    }

    return weaknesses;
  }

  private hasSequentialDigits(password: string): boolean {
    const sequences = ['01234', '12345', '23456', '34567', '45678', '56789'];
    return sequences.some(seq => password.includes(seq) || 
                                password.split('').reverse().join('').includes(seq));
  }

  private hasKeyboardPattern(password: string): boolean {
    return this.KEYBOARD_PATTERNS.some(pattern => {
      return password.includes(pattern) || 
             password.split('').reverse().join('').includes(pattern);
    });
  }

  private hasCommonSubstitutions(password: string): boolean {
    const normalizedPass = password.toLowerCase();
    for (const [letter, subs] of Object.entries(this.COMMON_SUBSTITUTIONS)) {
      for (const sub of subs) {
        if (password.includes(sub)) {
          // Проверяем, используется ли замена в контексте слова
          const regex = new RegExp(`\\w*${sub}\\w*`, 'i');
          if (regex.test(password)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private countUniqueChars(password: string): number {
    return new Set(password).size;
  }

  private containsEmail(password: string, email: string): boolean {
    const normalizedPassword = password.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const username = normalizedEmail.split('@')[0];
    
    return normalizedPassword.includes(username) || 
           normalizedPassword.includes(normalizedEmail);
  }

  private getStrengthLabel(strength: number): { strength: number; label: string; color: string } {
    if (strength === 0) return { strength: 0, label: 'Пустой', color: '#757575' };
    if (strength <= 25) return { strength: Math.max(5, strength), label: 'Слабый', color: '#ff4444' };
    if (strength <= 50) return { strength: strength, label: 'Средний', color: '#ffbb33' };
    if (strength <= 75) return { strength: strength, label: 'Хороший', color: '#00C851' };
    return { strength: strength, label: 'Отличный', color: '#2ecc71' };
  }
} 