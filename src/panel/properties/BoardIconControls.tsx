import { mergeClasses, Switch } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { FlippableObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const FlipControl: React.FC<PropertiesControlProps<FlippableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const flipVertical = commonValue(objects, (obj) => obj.flipVertical);
    const flipHorizontal = commonValue(objects, (obj) => obj.flipHorizontal);

    const everyHasFlipVertical = objects.every((obj) => obj.flipVertical !== undefined);
    const everyHasFlipHorizontal = objects.every((obj) => obj.flipHorizontal !== undefined);

    const toggleFlipVertical = () =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, flipVertical: !flipVertical })) });
    const toggleFlipHorizontal = () =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, flipHorizontal: !flipHorizontal })) });

    return (
        <>
            {everyHasFlipVertical && (
                <div className={mergeClasses(classes.row, classes.rightGap)}>
                    <Switch label={t('properties.flipVertical')} checked={flipVertical} onClick={toggleFlipVertical} />
                </div>
            )}
            {everyHasFlipHorizontal && (
                <div className={mergeClasses(classes.row, classes.rightGap)}>
                    <Switch
                        label={t('properties.flipHorizontal')}
                        checked={flipHorizontal}
                        onClick={toggleFlipHorizontal}
                    />
                </div>
            )}
        </>
    );
};
