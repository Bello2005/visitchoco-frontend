// Coeficientes de intensidad de las dos luces de la escena.
//
// Existe para que el sistema de calidad (y, si algún día se hace, un ciclo
// día/noche) pueda ajustar la iluminación SIN convertirse en un segundo
// escritor de `light.intensity`. RevealController sigue siendo el único que
// escribe, cada frame, leyendo de acá. Mismo patrón mutable que vehicleState.
//
// El ambiente bajó de 0.30/0.30 (lavanda #b9c3f5) a 0.18/0.22 (frío neutro)
// al llegar el sombreado estilizado: antes ese lavanda era lo ÚNICO que teñía
// las sombras de violeta, y hacerlo con luz ambiental aplana toda la escena.
// Ahora la sombra se tiñe en el shader, así que el ambiente vuelve a su
// trabajo real —rellenar los pliegues— y si se dejara alto teñiría dos veces
// (violeta sobre violeta = morado sucio).
export const lightingProfile = {
  dirBase: 0.55,
  dirGain: 0.8,
  ambBase: 0.18,
  ambGain: 0.22,
};
