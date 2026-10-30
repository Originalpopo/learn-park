// Skate park layouts, one per chapter zone, on a grid of 1x1 Kenney tiles (x → right, z → toward the camera).
// Each stop is one park feature: a list of pieces [model, x, z, rotation in degrees].
// Stops run as a snake: front row left → right, then back row right → left.
// decor = pieces drawn into the background (benches, pallets, the car); trees are simple low-poly shapes.
// Rotation notes: rails run along z, so 90 lays them along x. A U-shaped pipe is two pieces at 90 / -90 side by side.
const bowl2x2 = (m, x, z) => [[m, x, z, 0], [m, x + 1, z, 90], [m, x, z + 1, 270], [m, x + 1, z + 1, 180]];

export const PARKS = {
  ramps: {
    size: [12, 7],
    stops: [
      [['ramp', 0.5, 5, 90], ['obstacle-box', 1.5, 5, 0]],
      [['steps', 3.5, 5, 90], ['steps-rail', 4.5, 5, 90]],
      [['ramp', 6, 5, -90], ['obstacle-box', 7, 5, 0], ['ramp', 8, 5, 90]],
      [['half-pipe-low', 10, 5, 90], ['half-pipe-low', 11, 5, -90]],
      [['slope-smooth', 10.5, 1.5, 0], ['ramp-rail', 9.5, 1.5, 90]],
      [['obstacle-box', 6.5, 1.5, 90], ['obstacle-middle-rail', 7.5, 1.5, 90]],
      [['ramp-rail', 3.5, 1.5, 90], ['obstacle-box-grind', 4.5, 1.5, 90], ['ramp', 5.5, 1.5, -90]],
      [['half-pipe', 0.5, 1, 90], ['half-pipe', 1.5, 1, -90], ['half-pipe', 0.5, 2, 90], ['half-pipe', 1.5, 2, -90]]
    ],
    decor: [['bench', 5.8, 6.6, 0], ['pallet', 2.8, 0.1, 20], ['pallet', 3.2, 0.25, -10], ['skateboard', 8.5, 3.4, 60]],
    trees: [[-1.3, 1], [-1.3, 4.5], [12.3, 0], [5, -1.3], [9, -1.3]]
  },
  rails: {
    size: [12, 5],
    stops: [
      [['rail-low-end', 0.5, 2.5, 90], ['rail-low', 1.5, 2.5, 90], ['rail-low-end', 2.5, 2.5, -90]],
      [['obstacle-box', 4, 2.5, 90], ['obstacle-middle-rail', 5, 2.5, 90]],
      [['steps', 7.5, 1.5, 90], ['steps-rail', 7.5, 2.5, 90], ['steps', 7.5, 3.5, 90]],
      [['rail-slope', 9.5, 2.5, 90], ['rail-high', 10.5, 2.5, 90], ['rail-slope', 11.5, 2.5, -90]]
    ],
    decor: [['bench', 3, 4.6, 0], ['scooter', 9, 4.2, 70], ['benches', 11.4, 0.4, 0], ['pallet', 6, 0.2, 15]],
    trees: [[-1.3, 1.5], [12.3, 0], [6, -1.3]]
  },
  bowl: {
    size: [12, 7],
    stops: [
      bowl2x2('bowl-corner-inner-low', 0.5, 4.5),
      [['structure-wood-platform', 4.5, 5, 0], ['ramp', 5.5, 5, -90], ['ramp', 3.5, 5, 90]],
      bowl2x2('bowl-corner-inner', 8.5, 4.5),
      [['bowl-side', 8.5, 1, 0], ['bowl-side', 9.5, 1, 0], ['bowl-side', 8.5, 2, 180], ['bowl-side', 9.5, 2, 180]],
      [['bowl-corner-inner', 0.5, 1, 0], ['bowl-side', 1.5, 1, 0], ['bowl-side', 2.5, 1, 0], ['bowl-corner-inner', 3.5, 1, 90],
       ['bowl-corner-inner', 0.5, 2, 270], ['bowl-side', 1.5, 2, 180], ['bowl-side', 2.5, 2, 180], ['bowl-corner-inner', 3.5, 2, 180]]
    ],
    decor: [['vehicle', 6.2, 0.6, 0], ['bench', 7, 6.6, 0], ['pallet', 11.4, 3.2, 0]],
    trees: [[-1.3, 2], [-1.3, 6], [12.3, 0], [4, -1.3]]
  }
};
