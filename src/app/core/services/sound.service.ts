import { Injectable, OnDestroy } from '@angular/core';

const MUSIC_VOLUME_KEY = 'musicVolume';
const SOUND_VOLUME_KEY = 'soundVolume';
const DEFAULT_VOLUME = 1;
const INTERACTION_DELAY = 1000;

type AudioContextType = AudioContext;
type AudioSourceType = MediaElementAudioSourceNode;

@Injectable({
  providedIn: 'root'
})
export class SoundService implements OnDestroy {
  public audio: HTMLAudioElement;
  private audioContext?: AudioContextType;
  private audioSource?: AudioSourceType;
  private hasUserInteracted = false;
  private interactionTimeout?: number;
  private pendingMusicStart = false;
  private isGameActive = false;
  private readonly eventHandlers: { [key: string]: () => void };
  public currentMusicPath: string = 'assets/sounds/background-music.ogg';

  isMusicEnabled = true;
  isSoundEnabled = true;
  musicVolume: number = this.getSetting(MUSIC_VOLUME_KEY, DEFAULT_VOLUME);
  soundVolume: number = this.getSetting(SOUND_VOLUME_KEY, DEFAULT_VOLUME);
  isMusicPlaying = false;

  constructor() {
    this.audio = new Audio(this.currentMusicPath);
    this.audio.loop = true;
    this.audio.volume = this.musicVolume;
    
    this.eventHandlers = {
      click: () => this.handleFirstInteraction(),
      keydown: () => this.handleFirstInteraction(),
      touchstart: () => this.handleFirstInteraction()
    };

    this.initializeAudioContext();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupEventListeners(): void {
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      document.addEventListener(event, handler, { once: true });
    });
  }

  private cleanup(): void {
    if (this.audioSource) {
      this.audioSource.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }

    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      document.removeEventListener(event, handler);
    });
  }

  private handleFirstInteraction(): void {
    this.hasUserInteracted = true;
    if (this.pendingMusicStart && this.isGameActive) {
      this.startBackgroundMusic();
      this.pendingMusicStart = false;
    }
  }

  private initializeAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.audioSource = this.audioContext.createMediaElementSource(this.audio);
        this.audioSource.connect(this.audioContext.destination);
      } else {
        console.warn('Web Audio API is not supported in this browser.');
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  public onUserInteraction(): void {
    if (!this.hasUserInteracted) {
      this.pendingMusicStart = true;
    } else if (this.canPlayMusic()) {
      this.startBackgroundMusic();
    }
  }

  private canPlayMusic(): boolean {
    return this.isMusicEnabled && this.musicVolume > 0 && this.isGameActive;
  }

  public checkGameInteraction(): void {
    if (!this.isGameActive) return;

    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }

    this.interactionTimeout = window.setTimeout(() => {
      this.onUserInteraction();
    }, INTERACTION_DELAY);
  }

  public async changeBackgroundMusic(musicPath: string): Promise<void> {
    this.currentMusicPath = musicPath;
    this.stopBackgroundMusic();
    
    // Создаем новый аудио элемент
    this.audio = new Audio(this.currentMusicPath);
    this.audio.loop = true;
    this.audio.volume = this.musicVolume;
    
    // Переинициализируем аудио контекст для нового аудио элемента
    this.initializeAudioContext();
    
    // Если игра активна и музыка включена, начинаем воспроизведение
    if (this.isGameActive && this.isMusicEnabled && this.musicVolume > 0) {
      await this.startBackgroundMusic();
    }
  }

  public async startBackgroundMusic(): Promise<void> {
    if (!this.hasUserInteracted || !this.isGameActive) {
      this.pendingMusicStart = true;
      return;
    }

    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Убедимся, что аудио элемент настроен правильно
      this.audio.volume = this.musicVolume;
      this.audio.loop = true;
      
      await this.audio.play();
      this.isMusicPlaying = true;
      console.log('Background music started successfully.');
    } catch (error) {
      console.error('Error starting background music:', error);
      this.isMusicPlaying = false;
      if (error instanceof Error && error.name === 'NotAllowedError') {
        this.pendingMusicStart = true;
      }
    }
  }

  public stopBackgroundMusic(): void {
    this.audio.pause();
    this.isMusicPlaying = false;
  }

  public toggleBackgroundMusic(): void {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
  }

  public setGameActive(active: boolean): void {
    this.isGameActive = active;
    if (active) {
      if (this.canPlayMusic()) {
        this.startBackgroundMusic();
      }
    } else {
      this.stopBackgroundMusic();
    }
  }

  setMusicVolume(volume: number): void {
    this.audio.volume = volume;
    this.musicVolume = volume;
    this.saveSetting(MUSIC_VOLUME_KEY, volume);
    
    if (this.canPlayMusic()) {
      this.startBackgroundMusic();
    }
  }

  updateMusicVolume() {
    this.audio.volume = this.musicVolume;
  }

  setSoundVolume(volume: number): void {
    this.soundVolume = volume;
    this.saveSetting(SOUND_VOLUME_KEY, volume);
  }

  public async playSound(soundName: string): Promise<void> {
    if (!this.isSoundEnabled) return;

    try {
      const audio = new Audio(`assets/sounds/${soundName}.ogg`);
      audio.volume = this.soundVolume;
      await audio.play();
    } catch (error) {
      console.error('Ошибка воспроизведения звука:', error);
    }
  }

  onMusicSliderChange(value: number): void {
    this.isMusicEnabled = value > 0;
    if (!this.isMusicEnabled) {
      this.stopBackgroundMusic();
    } else if (this.isGameActive) {
      this.startBackgroundMusic();
    }
    this.setMusicVolume(value);
  }

  onSoundSliderChange(value: number): void {
    this.isSoundEnabled = value > 0;
    this.setSoundVolume(value);
  }

  private getSetting(key: string, defaultValue: number): number {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      this.saveSetting(key, defaultValue);
      return defaultValue;
    }
    return Number(storedValue);
  }

  private saveSetting(key: string, value: number): void {
    localStorage.setItem(key, String(value));
  }
} 