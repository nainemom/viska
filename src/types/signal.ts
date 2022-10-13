export enum SignalType {
  SessionDescription = 'sdp',
  IceServer = 'ice'
}

export interface Signal {
  peer: string,
  type: SignalType,
  body: any,
}

export interface SignalServerConfig {
  url: URL,
  pin?: string | null,
}
