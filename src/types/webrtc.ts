export interface WebRtcIceServerConfig {
  urls: URL[],
  // TODO add support for authorization fields
}

export interface WebRtcSignalServerConfig {
  url: URL,
  pin: string | null,
}

export interface WebRtcConfig {
  signalServer: WebRtcSignalServerConfig,
  iceServers: WebRtcIceServerConfig[],
}
