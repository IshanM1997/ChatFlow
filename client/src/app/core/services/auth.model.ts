export interface User {
  id:       string;
  username: string;
  avatar:   string;
  color:    string;
}

export interface LoginRequest  { username: string; password: string; }

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  user:         User;
}

export interface ChatRoom {
  id:          string;
  name:        string;
  description: string;
}

export interface ChatMessage {
  id:        string;
  roomId:    string;
  userId:    string;
  username:  string;
  avatar:    string;
  color:     string;
  text:      string;
  timestamp: string;
  readBy:    string[];
}

export interface TypingUser { userId: string; username: string; }
