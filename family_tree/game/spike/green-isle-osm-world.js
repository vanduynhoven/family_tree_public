// green-isle-osm-world.js - G0b spike: Green Isle, MN from OpenStreetMap (Era 5, 1955).
// Map data (c) OpenStreetMap contributors, ODbL 1.0 - https://www.openstreetmap.org/copyright
//
// GreenIsleWorld extends OsmWorld (haarlem-osm-world.js) with Green Isle-specific overrides:
// NPC is Johan van Duijnhoven (@I014@, b. 12 Nov 1915 Uden NL, age 39 in 1955), era label, attribution.
// Everything else (renderer, navigation, controls, builders) is inherited from OsmWorld / MankWorld.
//
// St. Brendan's Catholic Church (1863) is a synthetic 3D landmark. The real cemetery polygon
// (OSM way 584283841, landuse=cemetery) has its centroid at world coords x≈366 m, z≈-8 m —
// far east of the 120×85 m walkable window. The church mesh is placed at x=22, z=5 (on Parnell
// Street, just north of the player start) as the nearest visible in-world proxy.
import * as THREE from '../vendor/three/three.module.min.js';
import { MankWorld, S } from './mankato-osm-world.js';

export { S, hash32, pointInPoly, triangulate, Soup, box,
  buildBuildings, buildGround, buildWater, buildTrees, buildLamps, NavGrid, ribbon } from './mankato-osm-world.js';

// ── the world ─────────────────────────────────────────────────────────────────
export class GreenIsleWorld extends MankWorld {
  constructor(canvas, tier, data) {
    super(canvas, tier, data);
    // DOM label for the church — created dynamically so the HTML page needs no change.
    this._churchLabelEl = null;
    this._churchPos     = null;
  }

  // ── Green Isle overrides ──────────────────────────────────────────────────

  _buildWorld() {
    super._buildWorld();
    // Create church DOM label after the scene is initialised.
    const el = document.createElement('div');
    el.id = 'church-label';
    el.style.cssText = [
      'position:absolute',
      'background:rgba(0,0,0,.70)',
      'color:#fff',
      'font-size:11px',
      'padding:2px 7px',
      'border-radius:10px',
      'white-space:nowrap',
      'pointer-events:none',
      'transform:translate(-50%,-100%)',
      'display:none',
    ].join(';');
    document.getElementById('ui').appendChild(el);
    this._churchLabelEl = el;
    // Synthetic church mesh at x=22, z=5 (on Parnell Street, north of player start,
    // within the default camera frustum).
    this._addStBrendans(this._scene);
    // Expose a landmark nav-cell so the check script takes a dedicated shot.
    // Use the player's own default start position (c=90,r=64) with zoom=36 —
    // the church at (18,−12) appears directly north, upper-centre in this view.
    const k = this._nav.cellOf(18.86 * S, 13.51 * S);
    if (this.buildInfo) this.buildInfo.landmark = { x: k.c, y: k.r, zoom: 36 };
  }

  // ── St. Brendan's Catholic Church (1863) ─────────────────────────────────
  // Stone tower-nave church: grey limestone, square tower at the west gable,
  // gable roof on the nave, pyramidal spire on the tower.
  //
  // Position: x=18, z=−12 m — directly north of the player start point
  // (start=(18.86, 13.51)), visible in the default camera view from above-south.
  // The real St. Brendan's Catholic Cemetery (OSM way 584283841) centroid is at
  // world x≈366 m, z≈-8 m — far east of the rendered 120×85 m window.
  _addStBrendans(scene) {
    const cx = 18 * S;    // church centre x in world units
    const cz = -12 * S;   // church centre z in world units (north of player)
    this._churchPos = new THREE.Vector3(cx, 0, cz);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x8a8a7a });
    const roofMat  = new THREE.MeshLambertMaterial({ color: 0x5a5a4a });

    // Nave body: 16 m long (E–W) × 10 m wide (N–S) × 7 m tall
    const nave = new THREE.Mesh(
      new THREE.BoxGeometry(16 * S, 7 * S, 10 * S),
      stoneMat,
    );
    nave.position.set(cx, (7 / 2) * S, cz);
    scene.add(nave);

    // Tower: 6 m sq × 12 m tall, at the west end of the nave
    const towerCx = cx - (16 / 2 + 3) * S;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(6 * S, 12 * S, 6 * S),
      stoneMat,
    );
    tower.position.set(towerCx, (12 / 2) * S, cz);
    scene.add(tower);

    // Gable roof on the nave: two sloped faces meeting at a ridge along the E–W axis.
    // Ridge is 3.5 m above the eave (7 m), running the full 16 m length of the nave.
    // Each face slopes from the ridge down to a 10 m wide (N–S) eave.
    const naveRidgeH = 3.5 * S;
    const naveHalfL  = 8 * S;    // half the nave length (E–W)
    const naveHalfW  = 5 * S;    // half the nave width (N–S)
    const eaveY      = 7 * S;
    const ridgeY     = eaveY + naveRidgeH;
    // Four vertices: two ridge ends, two eave corners per slope face.
    // South slope (positive z face) and north slope (negative z face).
    const roofVerts = new Float32Array([
      // south slope (faces +z)
      cx - naveHalfL, eaveY, cz + naveHalfW,   // SW eave
      cx + naveHalfL, eaveY, cz + naveHalfW,   // SE eave
      cx + naveHalfL, ridgeY, cz,               // E ridge
      cx - naveHalfL, ridgeY, cz,               // W ridge
      // north slope (faces -z)
      cx + naveHalfL, eaveY, cz - naveHalfW,   // NE eave
      cx - naveHalfL, eaveY, cz - naveHalfW,   // NW eave
      cx - naveHalfL, ridgeY, cz,               // W ridge
      cx + naveHalfL, ridgeY, cz,               // E ridge
      // west gable end
      cx - naveHalfL, eaveY, cz - naveHalfW,   // NW eave
      cx - naveHalfL, eaveY, cz + naveHalfW,   // SW eave
      cx - naveHalfL, ridgeY, cz,               // W ridge
      // east gable end
      cx + naveHalfL, eaveY, cz + naveHalfW,   // SE eave
      cx + naveHalfL, eaveY, cz - naveHalfW,   // NE eave
      cx + naveHalfL, ridgeY, cz,               // E ridge
    ]);
    const roofIdx = new Uint16Array([
      0, 1, 2,  0, 2, 3,    // south slope
      4, 5, 6,  4, 6, 7,    // north slope
      8, 9, 10,             // west gable
      11, 12, 13,           // east gable
    ]);
    const roofGeo = new THREE.BufferGeometry();
    roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(roofVerts, 3));
    roofGeo.setIndex(new THREE.BufferAttribute(roofIdx, 1));
    roofGeo.computeVertexNormals();
    const naveRoof = new THREE.Mesh(roofGeo, roofMat);
    scene.add(naveRoof);

    // Tower spire: tall 4-sided pyramid, 7 m high
    const spireBase = 2.5 * S;
    const spireH    = 7 * S;
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0, spireBase, spireH, 4),
      roofMat,
    );
    spire.rotation.y = Math.PI / 4;
    spire.position.set(towerCx, (12 + spireH / 2) * S, cz);
    scene.add(spire);
  }

  // Project the church's spire apex to screen space every frame and update the label.
  _updateDomLabels() {
    super._updateDomLabels();
    if (!this._churchLabelEl || !this._churchPos) return;
    const apex = this._churchPos.clone();
    apex.y = (12 + 7 + 0.5) * S;   // top of spire
    const proj = apex.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    if (proj.z < 1) {
      const sx = (proj.x * 0.5 + 0.5) * rect.width;
      const sy = (-proj.y * 0.5 + 0.5) * rect.height;
      this._churchLabelEl.style.left    = sx + 'px';
      this._churchLabelEl.style.top     = sy + 'px';
      this._churchLabelEl.style.display = 'block';
      this._churchLabelEl.textContent   = "St. Brendan's (1863)";
    } else {
      this._churchLabelEl.style.display = 'none';
    }
  }

  // Johan van Duijnhoven, age 39, 1955 Green Isle
  _showBubble() {
    const head = this._npcMesh.position.clone(); head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    const sx = (proj.x * 0.5 + 0.5) * rect.width  + rect.left;
    const sy = (-proj.y * 0.5 + 0.5) * rect.height + rect.top;
    this._bubbleEl.style.left = sx + 'px';
    this._bubbleEl.style.top  = (sy - 10) + 'px';
    this._bubbleText.textContent = "Welkom! You must be from the old country. We moved here from Uden, in Noord-Brabant.";
    this._bubbleEl.style.display = 'block';
  }
}
