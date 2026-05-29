import { StructureInfo, StructureType } from '../renderers/structure-renderer.types';

export const STRUCTURE_INFO: Record<StructureType, StructureInfo> = {
  array: {
    title: '数组 Array',
    definition: '数组是一组连续存储的元素，支持通过下标进行随机访问。',
    features: ['连续内存', '随机访问快', '插入删除可能需要移动元素'],
    operations: [
      { name: '访问', complexity: 'O(1)', description: '通过下标直接访问元素。' },
      { name: '查找', complexity: 'O(n)', description: '顺序扫描直到找到目标。' },
      { name: '插入', complexity: 'O(n)', description: '可能需要移动后续元素。' },
      { name: '删除', complexity: 'O(n)', description: '可能需要移动后续元素。' },
    ],
    useCases: ['顺序表', '缓存', '矩阵', '动态数组底层结构'],
  },
  stack: {
    title: '栈 Stack',
    definition: '栈是一种后进先出 LIFO 的线性数据结构。',
    features: ['只允许在栈顶操作', '后进先出', '操作简单高效'],
    operations: [
      { name: 'push', complexity: 'O(1)', description: '向栈顶压入元素。' },
      { name: 'pop', complexity: 'O(1)', description: '弹出栈顶元素。' },
      { name: 'peek', complexity: 'O(1)', description: '查看栈顶元素。' },
    ],
    useCases: ['函数调用栈', '括号匹配', '表达式求值', '撤销操作'],
  },
  queue: {
    title: '队列 Queue',
    definition: '队列是一种先进先出 FIFO 的线性数据结构。',
    features: ['队尾入队', '队头出队', '先进先出'],
    operations: [
      { name: 'enqueue', complexity: 'O(1)', description: '向队尾加入元素。' },
      { name: 'dequeue', complexity: 'O(1)', description: '从队头移除元素。' },
      { name: 'front', complexity: 'O(1)', description: '查看队头元素。' },
    ],
    useCases: ['任务调度', '消息队列', 'BFS', '缓冲区'],
  },
  'linked-list': {
    title: '链表 Linked List',
    definition: '链表由节点组成，每个节点保存数据和指向下一个节点的引用。',
    features: ['非连续存储', '插入删除灵活', '随机访问较慢'],
    operations: [
      { name: '访问', complexity: 'O(n)', description: '需要从头节点逐个遍历。' },
      { name: '查找', complexity: 'O(n)', description: '逐个比较节点值。' },
      { name: '头插', complexity: 'O(1)', description: '直接修改头指针。' },
      { name: '删除', complexity: 'O(1) / O(n)', description: '已知前驱为 O(1)，否则需查找。' },
    ],
    useCases: ['链式栈', '链式队列', '邻接表', '内存管理'],
  },
  'binary-tree': {
    title: '二叉树 Binary Tree',
    definition: '二叉树是每个节点最多有两个子节点的树形结构。',
    features: ['层级结构', '递归定义', '适合表达搜索和层级关系'],
    operations: [
      { name: '查找', complexity: 'O(log n) / O(n)', description: '平衡时较快，退化时为线性。' },
      { name: '插入', complexity: 'O(log n) / O(n)', description: '按规则插入到子树中。' },
      { name: '遍历', complexity: 'O(n)', description: '前序、中序、后序或层序访问所有节点。' },
    ],
    useCases: ['表达式树', '搜索树', '堆', '语法分析'],
  },
  'b-plus-tree': {
    title: 'B+ 树 B+ Tree',
    definition: 'B+ 树是一种多路平衡搜索树，常用于数据库索引。',
    features: ['多路平衡', '内部节点只存索引', '数据集中在叶子节点', '叶子节点链表便于范围查询'],
    operations: [
      { name: '查找', complexity: 'O(logₘ n)', description: '从根节点沿索引向下查找到叶子。' },
      { name: '插入', complexity: 'O(logₘ n)', description: '插入到叶子节点，必要时分裂。' },
      { name: '删除', complexity: 'O(logₘ n)', description: '删除后可能合并或借位。' },
      { name: '范围查询', complexity: 'O(logₘ n + k)', description: '定位起点后沿叶子链表顺序扫描。' },
    ],
    useCases: ['数据库索引', '文件系统索引', '范围查询', '磁盘块管理'],
  },
};