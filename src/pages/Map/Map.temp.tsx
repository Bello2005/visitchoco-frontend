import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Popup, Circle } from "react-leaflet";
import { Tooltip } from "react-tooltip";
import { useMediaQuery } from "react-responsive";
import type { Municipality } from "../../services/municipality.service";
import { municipalityService } from "../../services/municipality.service";
import type { Map as LeafletMap } from "leaflet";
