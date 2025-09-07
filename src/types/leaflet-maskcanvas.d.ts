declare module "leaflet-maskcanvas" {
  import * as L from "leaflet";

  declare global {
    namespace L {
      function maskCanvas(options: any): L.GridLayer;

      interface GridLayer {
        setData(data: any): void;
      }
    }
  }
}
