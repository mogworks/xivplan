import { makeDisplayName } from '../util';
import { StatusIcon } from './StatusIcon';
import { useTranslation } from 'react-i18next';

function makeIcon(defaultNameKey: string, icon: string, scale?: number) {
    const Component: React.FC = () => {
        const { t } = useTranslation();
        const name = t(defaultNameKey);
        return <StatusIcon name={name} defaultNameKey={defaultNameKey} icon={`/marker/${icon}`} scale={scale} />;
    };
    Component.displayName = makeDisplayName(defaultNameKey);
    return Component;
}

export const StatusAttack1 = makeIcon('statusIcons.attack1', 'attack1.png', 2);
export const StatusAttack2 = makeIcon('statusIcons.attack2', 'attack2.png', 2);
export const StatusAttack3 = makeIcon('statusIcons.attack3', 'attack3.png', 2);
export const StatusAttack4 = makeIcon('statusIcons.attack4', 'attack4.png', 2);
export const StatusAttack5 = makeIcon('statusIcons.attack5', 'attack5.png', 2);
export const StatusAttack6 = makeIcon('statusIcons.attack6', 'attack6.png', 2);
export const StatusAttack7 = makeIcon('statusIcons.attack7', 'attack7.png', 2);
export const StatusAttack8 = makeIcon('statusIcons.attack8', 'attack8.png', 2);

export const StatusBind1 = makeIcon('statusIcons.bind1', 'bind1.png', 2);
export const StatusBind2 = makeIcon('statusIcons.bind2', 'bind2.png', 2);
export const StatusBind3 = makeIcon('statusIcons.bind3', 'bind3.png', 2);

export const StatusCounter1 = makeIcon('statusIcons.counter1', 'limit1.png');
export const StatusCounter2 = makeIcon('statusIcons.counter2', 'limit2.png');
export const StatusCounter3 = makeIcon('statusIcons.counter3', 'limit3.png');
export const StatusCounter4 = makeIcon('statusIcons.counter4', 'limit4.png');
export const StatusCounter5 = makeIcon('statusIcons.counter5', 'limit5.png');
export const StatusCounter6 = makeIcon('statusIcons.counter6', 'limit6.png');
export const StatusCounter7 = makeIcon('statusIcons.counter7', 'limit7.png');
export const StatusCounter8 = makeIcon('statusIcons.counter8', 'limit8.png');

export const StatusIgnore1 = makeIcon('statusIcons.ignore1', 'ignore1.png', 2);
export const StatusIgnore2 = makeIcon('statusIcons.ignore2', 'ignore2.png', 2);

export const StatusCircle = makeIcon('statusIcons.circle', 'circle.png', 2);
export const StatusCross = makeIcon('statusIcons.cross', 'cross.png', 2);
export const StatusSquare = makeIcon('statusIcons.square', 'square.png', 2);
export const StatusTriangle = makeIcon('statusIcons.triangle', 'triangle.png', 2);

export const StatusRedTarget = makeIcon('statusIcons.target', 'red_target.png');
export const StatusGreenTarget = makeIcon('statusIcons.target', 'green_target.png');
export const StatusBlueCircleTarget = makeIcon('statusIcons.target', 'blue_circle.png');
export const StatusGreenCircleTarget = makeIcon('statusIcons.target', 'green_circle.png');
export const StatusCrosshairs = makeIcon('statusIcons.target', 'crosshairs.png');

export const StatusDice1 = makeIcon('statusIcons.accelerationBomb1', 'dice1.png');
export const StatusDice2 = makeIcon('statusIcons.accelerationBomb2', 'dice2.png');
export const StatusDice3 = makeIcon('statusIcons.accelerationBomb3', 'dice3.png');

export const StatusEdenYellow = makeIcon('statusIcons.edenYellow', 'eden/yellow.png');
export const StatusEdenOrange = makeIcon('statusIcons.edenOrange', 'eden/orange.png');
export const StatusEdenBlue = makeIcon('statusIcons.edenBlue', 'eden/blue.png');

export const StatusUltimateCircle = makeIcon('statusIcons.circle', 'ultimate/circle.png');
export const StatusUltimateCross = makeIcon('statusIcons.cross', 'ultimate/cross.png');
export const StatusUltimateSquare = makeIcon('statusIcons.square', 'ultimate/square.png');
export const StatusUltimateTriangle = makeIcon('statusIcons.triangle', 'ultimate/triangle.png');
