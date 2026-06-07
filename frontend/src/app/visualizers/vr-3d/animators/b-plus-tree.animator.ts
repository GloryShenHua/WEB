import * as THREE from 'three';
import { AnimationContext, StructureAnimator } from './structure-animator.interface';

interface BPlusSceneNode {
  group: THREE.Group;
  keys: string[];
  isLeaf: boolean;
  level: number;
  position: THREE.Vector3;
}

export class BPlusTreeAnimator implements StructureAnimator {
  private readonly leafCapacity = 3;

  async performOperation(operationName: string, ctx: AnimationContext): Promise<void> {
    if (operationName === '查找') {
      await this.search(ctx);
    } else if (operationName === '插入') {
      await this.insert(ctx);
    } else if (operationName === '删除') {
      await this.delete(ctx);
    } else if (operationName === '范围查找') {
      await this.rangeSearch(ctx);
    }
  }

  private async search(ctx: AnimationContext): Promise<void> {
    const value = prompt('请输入要查找的关键字', ctx.data.values[0] ?? '50')?.trim();
    if (!value) return;

    const path = this.findPath(ctx, value);
    ctx.announce?.(`查找 ${value}：从根节点沿索引向下定位叶子节点`);
    for (const node of path) {
      await this.highlight(node.group, 0xfacc15);
    }

    const leaf = path.at(-1);
    if (!leaf) return;
    const found = leaf.keys.includes(value);
    await this.highlight(leaf.group, found ? 0x22c55e : 0xef4444);
    ctx.announce?.(found ? `找到关键字 ${value}` : `叶子节点中不存在 ${value}`);
  }

  private async insert(ctx: AnimationContext): Promise<void> {
    const value = prompt('请输入要插入的关键字', '25')?.trim();
    if (!value) return;

    const path = this.findPath(ctx, value);
    ctx.announce?.(`插入 ${value}：先定位目标叶子节点`);
    for (const node of path) {
      await this.highlight(node.group, 0x38bdf8);
    }

    const leaf = path.at(-1);
    if (leaf) {
      const nextLeafKeys = this.sortedUnique([...leaf.keys, value]);
      const willSplit = nextLeafKeys.length > this.leafCapacity;
      await this.highlight(leaf.group, willSplit ? 0xf97316 : 0x22c55e);
      ctx.announce?.(
        willSplit
          ? `叶子节点超过 ${this.leafCapacity} 个关键字，演示分裂并上提索引`
          : '插入后叶子节点仍保持有序'
      );
    }

    ctx.updateData({ values: this.sortedUnique([...ctx.data.values, value]) });
  }

  private async delete(ctx: AnimationContext): Promise<void> {
    const value = prompt('请输入要删除的关键字', ctx.data.values[0] ?? '30')?.trim();
    if (!value) return;

    const path = this.findPath(ctx, value);
    ctx.announce?.(`删除 ${value}：先定位关键字所在叶子节点`);
    for (const node of path) {
      await this.highlight(node.group, 0xfacc15);
    }

    const exists = ctx.data.values.includes(value);
    if (!exists) {
      ctx.announce?.(`未找到 ${value}，无法删除`);
      return;
    }

    const leaf = path.at(-1);
    if (leaf) await this.highlight(leaf.group, 0xef4444);
    ctx.updateData({ values: ctx.data.values.filter(item => item !== value) });
    ctx.announce?.(`删除完成，必要时需要借位或合并叶子节点`);
  }

  private async rangeSearch(ctx: AnimationContext): Promise<void> {
    const start = prompt('请输入范围起点', '20')?.trim();
    const end = prompt('请输入范围终点', '60')?.trim();
    if (!start || !end) return;

    const [min, max] = this.compare(start, end) <= 0 ? [start, end] : [end, start];
    ctx.announce?.(`范围查找 [${min}, ${max}]：定位起点后沿叶子链表扫描`);

    const nodes = this.collectNodes(ctx.scene);
    const leaves = nodes.filter(node => node.isLeaf).sort((a, b) => a.position.x - b.position.x);
    for (const leaf of leaves) {
      const hit = leaf.keys.some(key => this.compare(key, min) >= 0 && this.compare(key, max) <= 0);
      await this.highlight(leaf.group, hit ? 0x22c55e : 0x64748b);
    }

    const result = ctx.data.values.filter(item => this.compare(item, min) >= 0 && this.compare(item, max) <= 0);
    ctx.announce?.(`范围结果：${result.join(', ') || '无'}`);
  }

  private findPath(ctx: AnimationContext, target: string): BPlusSceneNode[] {
    const nodes = this.collectNodes(ctx.scene);
    const levels = [...new Set(nodes.map(node => node.level))].sort((a, b) => b - a);
    const path: BPlusSceneNode[] = [];

    for (const level of levels) {
      const candidates = nodes.filter(node => node.level === level).sort((a, b) => a.position.x - b.position.x);
      if (candidates.length === 0) continue;
      path.push(this.chooseNode(candidates, target));
    }

    return path;
  }

  private collectNodes(scene: THREE.Scene): BPlusSceneNode[] {
    const nodes: BPlusSceneNode[] = [];
    scene.traverse(obj => {
      if (obj.userData?.['nodeType'] !== 'bplus-node') return;
      const group = obj as THREE.Group;
      nodes.push({
        group,
        keys: Array.isArray(group.userData['keys']) ? group.userData['keys'].map(String) : [],
        isLeaf: group.userData['isLeaf'] === true,
        level: Number(group.userData['level'] ?? 0),
        position: group.position.clone(),
      });
    });
    return nodes;
  }

  private chooseNode(nodes: BPlusSceneNode[], target: string): BPlusSceneNode {
    return nodes.find(node => {
      const first = node.keys[0];
      const last = node.keys.at(-1);
      return first !== undefined && last !== undefined && this.compare(target, first) >= 0 && this.compare(target, last) <= 0;
    }) ?? [...nodes].reverse().find(node => node.keys[0] !== undefined && this.compare(node.keys[0], target) <= 0) ?? nodes[0];
  }

  private async highlight(node: THREE.Group, color: number): Promise<void> {
    const mesh = node.children.find(child => (child as THREE.Mesh).isMesh) as THREE.Mesh | undefined;
    const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
    if (!material) return;

    const original = Number(node.userData?.['originalColor'] ?? 0x3b82f6);
    material.color.setHex(color);
    material.emissive.setHex(color);
    material.emissiveIntensity = 0.75;
    node.scale.set(1.08, 1.08, 1.08);
    await this.delay(520);
    material.color.setHex(original);
    material.emissive.setHex(original);
    material.emissiveIntensity = 0.12;
    node.scale.set(1, 1, 1);
  }

  private sortedUnique(values: string[]): string[] {
    return [...new Set(values.map(value => value.trim()).filter(Boolean))]
      .sort((a, b) => this.compare(a, b));
  }

  private compare(a: string, b: string): number {
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.localeCompare(b, 'zh-Hans-CN', { numeric: true });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
