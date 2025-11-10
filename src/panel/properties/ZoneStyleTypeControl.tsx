import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { ZoneStyleObject, ZoneStyleType } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ZoneStyleTypeControl: React.FC<PropertiesControlProps<ZoneStyleObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const solid = commonValue(objects, (obj) => obj.styleType === 'solid');
    const hollow = commonValue(objects, (obj) => obj.styleType === 'hollow');

    const styleType = solid ? 'solid' : hollow ? 'hollow' : 'realistic';

    const onVariantChanged = (styleType: ZoneStyleType) => {
        if (styleType === 'solid') {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, styleType: 'solid' })) });
        } else if (styleType === 'hollow') {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, styleType: 'hollow' })),
            });
        } else {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, styleType: 'realistic' })),
            });
        }
    };

    return (
        <Field label={t('properties.style')}>
            <SegmentedGroup
                name="shape-style"
                value={styleType}
                onChange={(ev, data) => onVariantChanged(data.value as ZoneStyleType)}
            >
                <Segment
                    value={'realistic'}
                    size="mediumText"
                    title={t('properties.realistic')}
                    icon={<RealisticIcon aria-label={t('properties.realistic')} />}
                />
                <Segment value={'solid'} size="mediumText" title={t('properties.solid')} icon={<CircleFilled />} />
                <Segment value={'hollow'} size="mediumText" title={t('properties.hollow')} icon={<CircleRegular />} />
            </SegmentedGroup>
        </Field>
    );
};

/** A simple inline SVG icon to represent 'realistic' effect */
const RealisticIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
        <defs>
            <linearGradient id="aoe-realistic-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb777" />
                <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
        </defs>
        {/* Base fill, larger to improve visual presence */}
        <rect x="2.5" y="4.5" width="19" height="15" rx="4" fill="url(#aoe-realistic-grad)" />
        {/* Outer outline (外轮廓) */}
        <rect x="2.5" y="4.5" width="19" height="15" rx="4" fill="none" stroke="#fffc79" strokeWidth="2" />
        {/* Inner glow */}
        <rect x="4" y="6" width="16" height="12" rx="3" fill="none" stroke="#ff751f" strokeWidth="1.5" opacity="0.8" />
    </svg>
);
