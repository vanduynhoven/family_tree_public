// ═══════════════════════════════════════════════════════════
//  Markers3D - the click-target ring, the onboarding arrow and the fishing bobber as simple 3D markers (G1)
//
//  Positions come in as WORLD PIXELS like everything else in the renderer interface and are divided by TILE
//  (48) to get world units. All three markers are single small meshes, hidden when they are not in use.
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';
import { TILE } from '../Renderer.js';
import { MeshBuilder, lin, shade } from './MeshBuilder3D.js';

export class Markers {
  constructor(scene) {
    this.scene = scene;
    this._build();
  }

  _build() {
    // click target: a dashed ring with four cross-hair ticks, flat on the ground
    const rb = new MeshBuilder();
    const yel = [1, 0.95, 0.35];
    const r0 = 0.3, r1 = 0.36, seg = 4;
    for (let a = 0; a < 6; a++) {
      const s0 = (a / 6) * Math.PI * 2 + 0.12, s1 = ((a + 1) / 6) * Math.PI * 2 - 0.12;
      for (let k = 0; k < seg; k++) {
        const t0 = s0 + (s1 - s0) * (k / seg), t1 = s0 + (s1 - s0) * ((k + 1) / seg);
        rb.quad(Math.cos(t0) * r0, 0, Math.sin(t0) * r0, Math.cos(t0) * r1, 0, Math.sin(t0) * r1,
          Math.cos(t1) * r1, 0, Math.sin(t1) * r1, Math.cos(t1) * r0, 0, Math.sin(t1) * r0, yel);
      }
    }
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x0 = dx * 0.18, x1 = dx * 0.52, z0 = dz * 0.18, z1 = dz * 0.52, w = 0.035;
      rb.top(Math.min(x0, x1) - (dx ? 0 : w), Math.min(z0, z1) - (dz ? 0 : w), Math.max(x0, x1) + (dx ? 0 : w), Math.max(z0, z1) + (dz ? 0 : w), 0, yel);
    }
    this.ring = new THREE.Mesh(rb.toGeometry(false), new THREE.MeshBasicMaterial({
      color: 0xfff060, transparent: true, opacity: 0.85, depthWrite: false, fog: false, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
    }));
    this.ring.visible = false; this.ring.renderOrder = 6; this.ring.frustumCulled = false;
    this.scene.add(this.ring);

    // onboarding arrow: dark outline + yellow arrow lying on the ground, +x is the tip
    const arrow = (grow) => {
      const b = new MeshBuilder(), c = [1, 1, 1];
      const g = grow;
      b.tri(0.5 + g * 1.4, 0, 0, 0.02 - g, 0, -0.3 - g, 0.02 - g, 0, 0.3 + g, c);
      b.top(-0.42 - g, -0.1 - g, 0.04, 0.1 + g, 0, c);
      return b.toGeometry(false);
    };
    this.arrowLine = new THREE.Mesh(arrow(0.06), new THREE.MeshBasicMaterial({ color: 0x806010, transparent: true, opacity: 0.8, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    this.arrow = new THREE.Mesh(arrow(0), new THREE.MeshBasicMaterial({ color: 0xf0e040, transparent: true, opacity: 0.9, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    for (const m of [this.arrowLine, this.arrow]) { m.visible = false; m.renderOrder = 7; m.frustumCulled = false; this.scene.add(m); }

    // fishing: bobber (white float with a red cap), ripple ring, rod and line
    const bb = new MeshBuilder();
    bb.ico(0, 0, 0, 0.075, 0.1, 0.075, 0, [0.95, 0.95, 0.95]);
    bb.cone(0, 0.02, 0, 0.065, 0.13, 8, lin('#e02020'), lin('#ff5050'));
    bb.cyl(0, 0.14, 0, 0.012, 0.012, 0.1, 4, [0.1, 0.1, 0.1], [0.1, 0.1, 0.1]);
    this.bobberMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.bobber = new THREE.Mesh(bb.toGeometry(false), this.bobberMat);
    this.ripple = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 20).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x80c8ff, transparent: true, opacity: 0.6, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    const rodGeo = new THREE.CylinderGeometry(0.014, 0.022, 1, 5); rodGeo.rotateX(Math.PI / 2); rodGeo.translate(0, 0, 0.5);
    this.rod = new THREE.Mesh(rodGeo, new THREE.MeshLambertMaterial({ color: 0x6a4a28 }));
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(14 * 3), 3));
    this.line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xe8e0c0, fog: false }));
    for (const m of [this.bobber, this.ripple, this.rod, this.line]) { m.visible = false; m.frustumCulled = false; this.scene.add(m); }
    this.ripple.renderOrder = 6;
  }

  /** @param view the renderer-interface view @param terrain TerrainSet (ground heights) */
  update(view, terrain) {
    const { player, frame, clickTarget, guide } = view;
    const T_ = TILE;

    // click target
    if (clickTarget) {
      const x = clickTarget.tx / T_, z = clickTarget.ty / T_;
      const s = 1 + 0.08 * Math.sin(frame / 7);
      this.ring.visible = true;
      this.ring.position.set(x, terrain.heightAt(x, z) + 0.05, z);
      this.ring.scale.set(s, 1, s);
      this.ring.rotation.y = frame / 90;
    } else this.ring.visible = false;

    // guide arrow
    if (guide && player) {
      const px = player.cx / T_, pz = player.cy / T_;
      const ang = Math.atan2(guide.y / T_ - pz, guide.x / T_ - px);
      const r = 0.95;
      const ax = px + Math.cos(ang) * r, az = pz + Math.sin(ang) * r;
      const y = terrain.heightAt(ax, az) + 0.09 + 0.03 * Math.sin(frame / 10);
      const pulse = 0.7 + Math.sin(frame / 10) * 0.3;
      for (const m of [this.arrow, this.arrowLine]) {
        m.visible = true; m.position.set(ax, y, az); m.rotation.y = -ang;
      }
      this.arrow.material.opacity = 0.35 + 0.6 * pulse;
      this.arrowLine.material.opacity = 0.25 + 0.5 * pulse;
      this.arrowLine.position.y = y - 0.004;
    } else { this.arrow.visible = false; this.arrowLine.visible = false; }

    // fishing
    if (player && player.fishTimer > 0) {
      const bx = player.bobberX / T_, bz = player.bobberY / T_;
      const dip = !!player.fishDipped;
      const bob = dip ? -0.1 : Math.sin(frame / 22) * 0.05;
      const wy = Math.max(terrain.heightAt(bx, bz), -0.12);
      this.bobber.visible = true;
      this.bobber.position.set(bx, wy + 0.08 + bob, bz);
      this.bobberMat.color.setRGB(dip ? 1 : 1, dip ? 0.45 : 1, dip ? 0.45 : 1);
      this.ripple.visible = dip;
      if (dip) {
        const k = (frame % 30) / 30;
        this.ripple.position.set(bx, wy + 0.02, bz);
        this.ripple.scale.set(1 + k * 1.4, 1, 1 + k * 1.4);
        this.ripple.material.opacity = 0.6 * (1 - k);
      }
      // rod: from the hand towards the facing direction and up; line from the rod tip to the float
      const f = facingVec(player.facing);
      const fx = player.cx / T_, fz = (player.y + player.h * 0.92) / T_, fy = terrain.heightAt(fx, fz);
      const gx = fx + f[0] * 0.3, gy = fy + 0.55, gz = fz + f[1] * 0.3;
      const tx = gx + f[0] * 0.42, ty = gy + 0.5, tz = gz + f[1] * 0.42;
      this.rod.visible = true;
      this.rod.position.set(gx, gy, gz);
      this.rod.scale.set(1, 1, Math.hypot(tx - gx, ty - gy, tz - gz));
      this.rod.lookAt(tx, ty, tz);
      const pos = this.line.geometry.attributes.position;
      const n = pos.count;
      const ex = bx, ey = wy + 0.2 + bob, ez = bz;
      const sag = 0.12 + 0.05 * Math.sin(frame / 30);
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        pos.setXYZ(i, tx + (ex - tx) * u, ty + (ey - ty) * u - Math.sin(u * Math.PI) * sag * Math.min(2, Math.hypot(ex - tx, ez - tz)), tz + (ez - tz) * u);
      }
      pos.needsUpdate = true;
      this.line.visible = true;
    } else {
      this.bobber.visible = false; this.ripple.visible = false; this.rod.visible = false; this.line.visible = false;
    }
  }

  dispose() {
    for (const m of [this.ring, this.arrow, this.arrowLine, this.bobber, this.ripple, this.rod, this.line]) {
      this.scene.remove(m); m.geometry.dispose(); m.material.dispose();
    }
  }
}

/** [dx, dz] in world units for an entity facing ('up' is north = -z). */
export function facingVec(f) {
  switch (f) {
    case 'up': return [0, -1];
    case 'left': return [-1, 0];
    case 'right': return [1, 0];
    default: return [0, 1];
  }
}
