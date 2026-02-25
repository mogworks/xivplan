import { useTranslation } from 'react-i18next';
import { Circle, Group, Image, Path } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechGazeObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const icon = new URL(`board/objects/13.webp`, import.meta.env.VITE_COS_URL).href;
const DEFAULT_SIZE = 60;

const RESPONSIVE_SIZE_SCALE = 0.75;

export const MechGazePrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.gaze')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechGaze,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechGazeObject>(ObjectType.MechGaze, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechGaze,
            invert: false,
            radius: DEFAULT_SIZE,
            rotation: 0,
            opacity: 100,
            ...object,
            ...position,
        } as MechGazeObject,
    };
});

const QUESTION_PATH = `
    M-17.5-15c0 5 2 5 3 5 3 0 5.5-1 5.5-7s4.5-8.5 9-8.5C5.5-25.5 9.5-21 9.5-13.5 9.5-5-2-3-2 11
    c0 4 0 7 2 7 2 0 2-3 2-7C2-2 17.5 0 17.5-14 17.5-24 11.5-29 0-29-14.5-29-17.5-19.5-17.5-15Z
    M0 20.5c-2.5 0-4 1.5-4 3.5 0 3 1.5 6 4 6s4-3 4-6c0-2-1.5-3.5-4-3.5Z`;
const QUESTION_SHADOW_COLOR = '#8b2996ff';

const QuestionMark: React.FC<{ x: number; y: number; scaleX: number; scaleY: number }> = ({ x, y, scaleX, scaleY }) => {
    return (
        <Path
            x={x}
            y={y}
            data={QUESTION_PATH}
            scaleX={scaleX}
            scaleY={scaleY}
            stroke={QUESTION_SHADOW_COLOR}
            strokeWidth={4}
            fillAfterStrokeEnabled
            shadowColor={QUESTION_SHADOW_COLOR}
            shadowBlur={4}
            shadowForStrokeEnabled
            fill="#ffffff"
            listening={false}
        />
    );
};

export const MechGazeRenderer: React.FC<RendererProps<MechGazeObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(icon);

    // 调整一下显示比例，使尺寸数值更加符合视觉效果
    const responsiveSize = object.radius * RESPONSIVE_SIZE_SCALE;
    const strokeWidth = Math.max(2, Math.min(4, responsiveSize / 100));

    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && <Circle radius={responsiveSize + strokeWidth / 2} {...highlightProps} />}
                    <HideGroup>
                        <Image
                            image={image}
                            x={-object.radius}
                            y={-object.radius}
                            width={object.radius * 2}
                            height={object.radius * 2}
                            opacity={object.opacity / 100}
                            listening={false}
                        />
                        <Circle radius={responsiveSize} opacity={0} />
                        {object.invert && (
                            <QuestionMark x={0} y={0} scaleX={object.radius / 80} scaleY={object.radius / 80} />
                        )}
                        {groupProps.isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={SPOTLIGHT_COLOR} />}
                    </HideGroup>
                </Group>
            )}
        </RadiusObjectContainer>
    );
};

registerRenderer<MechGazeObject>(ObjectType.MechGaze, LayerName.Ground, MechGazeRenderer);

export const MechGazeDetails: React.FC<ListComponentProps<MechGazeObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(`mechanic.gaze.${object.invert ? 'invert' : 'normal'}`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<MechGazeObject>(ObjectType.MechGaze, MechGazeDetails);
