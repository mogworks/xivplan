import { Field, mergeClasses } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ExtendableObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ExtendableControl: React.FC<PropertiesControlProps<ExtendableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const hNum = commonValue(objects, (obj) => obj.hNum);
    const vNum = commonValue(objects, (obj) => obj.vNum);

    const everyHasHNum = objects.every((obj) => obj.hNum !== undefined);
    const everyHasVNum = objects.every((obj) => obj.vNum !== undefined);

    const onHNumChanged = useSpinChanged((hNum: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, hNum })) }),
    );
    const onVNumChanged = useSpinChanged((vNum: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, vNum })) }),
    );

    return (
        (everyHasHNum || everyHasVNum) && (
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                {everyHasHNum && (
                    <Field label={t('properties.hNum')} className={classes.cell}>
                        <SpinButton value={hNum} onChange={onHNumChanged} min={1} step={1} />
                    </Field>
                )}
                {everyHasVNum && (
                    <Field label={t('properties.vNum')} className={classes.cell}>
                        <SpinButton value={vNum} onChange={onVNumChanged} min={1} step={1} />
                    </Field>
                )}
            </div>
        )
    );
};
