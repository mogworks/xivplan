import { nanoid } from 'nanoid';
import { SceneObject, SceneStep } from '../scene';
import { EditorState, SceneAction } from '../SceneProvider';
import { getSelectedObjects } from '../selection';
import { SceneSelection } from '../SelectionContext';
import { UndoRedoAction } from '../undo/undoReducer';
import { omit } from '../util';

// 编组
export const groupSelectedObjects = (
    step: SceneStep,
    selection: SceneSelection,
    dispatch: React.Dispatch<SceneAction | UndoRedoAction<EditorState>>,
) => {
    const selectedObjects = getSelectedObjects(step, selection);
    if (selectedObjects.length < 2) {
        return;
    }

    const selectedObjectIds = new Set(selectedObjects.map((obj) => obj.id));

    // 查找所有包含选中对象的组
    const groupIds = selectedObjects.map((obj) => obj.groupId).filter((groupId) => !!groupId);
    const uniqueGroupIds = new Set(groupIds);

    // 把 step.objects 中未被选中的元素按 uniqueGroupIds 分类
    const objectsByGroup = new Map<string, SceneObject[]>();
    step.objects.forEach((obj) => {
        // 跳过没有 groupId 的对象 或 选中的对象 或 不在 uniqueGroupIds 中的对象
        if (!obj.groupId || selectedObjectIds.has(obj.id) || !uniqueGroupIds.has(obj.groupId)) {
            return;
        }
        const oldObjects = objectsByGroup.get(obj.groupId) || [];
        objectsByGroup.set(obj.groupId, [...oldObjects, obj]);
    });

    const ungroupUpdates: SceneObject[] = [];

    // 筛选出 objectsByGroup 中元素数量少于2的组，提取所有对象，删除其 groupId
    [...objectsByGroup.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, objs]) => objs.length < 2)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .flatMap(([_, objs]) => objs)
        .forEach((obj) => {
            ungroupUpdates.push(omit(obj, 'groupId'));
        });

    const newGroupId = nanoid(6);
    const groupUpdates = selectedObjects.map((obj) => ({ ...obj, groupId: newGroupId }));

    dispatch({
        type: 'update',
        value: [...groupUpdates, ...ungroupUpdates],
    });
};

// 解除编组
export const ungroupSelectedObjects = (
    step: SceneStep,
    selection: SceneSelection,
    dispatch: React.Dispatch<SceneAction | UndoRedoAction<EditorState>>,
) => {
    const selectedObjects = getSelectedObjects(step, selection).filter((obj) => !!obj.groupId);
    if (selectedObjects.length === 0) {
        return;
    }

    const selectedObjectIds = new Set(selectedObjects.map((obj) => obj.id));

    // 查找所有包含选中对象的组
    const groupIds = selectedObjects.map((obj) => obj.groupId);
    const uniqueGroupIds = new Set(groupIds);

    // 把 step.objects 中未被选中的元素按 uniqueGroupIds 分类
    const objectsByGroup = new Map<string, SceneObject[]>();
    step.objects.forEach((obj) => {
        // 跳过没有 groupId 的对象 或 选中的对象 或 不在 uniqueGroupIds 中的对象
        if (!obj.groupId || selectedObjectIds.has(obj.id) || !uniqueGroupIds.has(obj.groupId)) {
            return;
        }
        const oldObjects = objectsByGroup.get(obj.groupId) || [];
        objectsByGroup.set(obj.groupId, [...oldObjects, obj]);
    });

    // 筛选出 objectsByGroup 中元素数量少于2的组，提取所有对象
    const smallGroupObjs = [...objectsByGroup.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, objs]) => objs.length < 2)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .flatMap(([_, objs]) => objs);

    // 合并 selectedObjects 和 smallGroupObjs
    const objs = [...selectedObjects, ...smallGroupObjs];

    dispatch({
        type: 'update',
        value: objs.map((obj) => omit(obj, 'groupId')),
    });
};
