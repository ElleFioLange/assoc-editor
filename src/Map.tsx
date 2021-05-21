import React, { Component } from "react";
import { Map, GoogleApiWrapper, IMapProps } from "google-maps-react";

export class MapContainer extends Component<IMapProps & { mapDim: number }> {
  render(): JSX.Element {
    return (
      <Map
        {...this.props}
        style={{
          height: this.props.mapDim,
          width: this.props.mapDim,
        }}
        initialCenter={{
          lat: 35.10955714631318,
          lng: -106.61210092788741,
        }}
      />
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyAL2tKfMF05QvN97Xu7H8F3Oridq_U2Wew",
})(MapContainer);
