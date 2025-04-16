import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordStrengthService {

  calculateStrength(password: string, email: string = ''): { strength: number; label: string; color: string } {
    let strength = 0;

    if (!password) {
      return { strength: 0, label: 'Не введен', color: 'gray' };
    }

    // Критерии пароля
    const hasLength = password.length >= 8 && password.length <= 32;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isNotEmailRelated = !email || !password.toLowerCase().includes(email.toLowerCase().split('@')[0]); //Проверка на связь с email

    // Проверка соответствия всем критериям
    const allCriteriaMet = hasLength && hasUpperCase && hasSpecialChar && hasNumber && isNotEmailRelated;

    // Начисление баллов за соответствие критериям
    if (hasLength) {
      strength += 20;
    }
    if (hasUpperCase) {
      strength += 20;
    }
    if (hasSpecialChar) {
      strength += 20;
    }
    if (hasNumber) {
      strength += 20;
    }

    if (isNotEmailRelated) {
      strength += 20;
    }


    // Определение уровня сложности и цвета
    let label = '';
    let color = '';

    if (!allCriteriaMet) {
      label = 'Слабый';
      color = 'red';
    } else if (strength <= 60) { // Пароль соответствует всем критериям, но все еще относительно слабый
        label = 'Средний';
        color = 'yellowgreen';
    }
    else if (strength <= 80) {
      label = 'Сильный';
      color = 'green';
    } else if (strength <= 100) {
        label = 'Сильный';
        color = 'darkgreen';
    }
    else {
        label = 'Неопределённый'; // На всякий случай
        color = 'gray';
    }

    return { strength, label, color };
  }
}