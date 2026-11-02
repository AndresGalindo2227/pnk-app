/** Player of the current session, as the rest of the app sees it. */
export interface SessionPlayer {
  readonly id: number;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly role: 'player' | 'admin';
}

/** Tokens and player returned by login, register and refresh. */
export interface SessionTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly player: SessionPlayer;
}
