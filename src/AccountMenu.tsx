import {
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    makeStyles,
} from '@fluentui/react-components';
import { PersonRegular, SignOutRegular } from '@fluentui/react-icons';
import { useState } from 'react';
import { authClient } from './auth/client';

const useStyles = makeStyles({
    iconButton: {
        minWidth: '40px',
        width: '40px',
    },
    usernameItem: {
        cursor: 'default',
    },
    dialogActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '20px',
    },
    dialogSurface: {
        maxWidth: '400px',
    },
});

export const AccountMenu = () => {
    const classes = useStyles();
    const { data: authData } = authClient.useSession();
    const { user, session } = authData || {};
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const openPopup = (tab: 'signin' | 'signup' = 'signin') => {
        const width = 900;
        const height = tab === 'signup' ? 820 : 640;
        const left = Math.round((window.innerWidth - width) / 2);
        const top = Math.round((window.innerHeight - height) / 2);

        const loginUrl = new URL('/login', import.meta.env.VITE_BASE_URL);
        loginUrl.searchParams.set('callbackURL', import.meta.env.VITE_SITE_URL);
        loginUrl.searchParams.set('isPopup', 'true');
        loginUrl.searchParams.set('tab', tab);
        const popup = window.open(loginUrl, 'authPopup', `width=${width},height=${height},left=${left},top=${top}`);
        if (popup) {
            const handleMessage = (event: MessageEvent) => {
                if (event.origin === import.meta.env.VITE_BASE_URL && event.data === 'auth-success') {
                    window.location.reload();
                    window.removeEventListener('message', handleMessage);
                }
            };
            window.addEventListener('message', handleMessage);
        }
    };

    const handleLoginClick = () => {
        openPopup('signin');
    };

    const handleRegisterClick = () => {
        openPopup('signup');
    };

    const handleAccountClick = () => {
        if (user && session) {
            window.open(`${import.meta.env.VITE_BASE_URL}/account`, '_blank');
        }
    };

    const handleLogoutClick = () => {
        setIsLogoutDialogOpen(true);
    };

    const confirmLogout = () => {
        authClient.signOut();
        setIsLogoutDialogOpen(false);
    };

    return (
        <>
            <Menu>
                <MenuTrigger disableButtonEnhancement>
                    <Button appearance="subtle" className={classes.iconButton} icon={<PersonRegular />} />
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        {user && session ? (
                            <>
                                <MenuItem disabled className={classes.usernameItem}>
                                    {user.name}
                                </MenuItem>
                                <MenuItem icon={<SignOutRegular />} onClick={handleAccountClick}>
                                    账户
                                </MenuItem>
                                <MenuItem icon={<SignOutRegular />} onClick={handleLogoutClick}>
                                    登出
                                </MenuItem>
                            </>
                        ) : (
                            <>
                                <MenuItem onClick={handleLoginClick}>登录</MenuItem>
                                <MenuItem onClick={handleRegisterClick}>注册</MenuItem>
                            </>
                        )}
                    </MenuList>
                </MenuPopover>
            </Menu>

            <Dialog open={isLogoutDialogOpen} onOpenChange={(event, data) => setIsLogoutDialogOpen(data.open)}>
                <DialogSurface className={classes.dialogSurface}>
                    <DialogBody>
                        <DialogTitle>确认登出</DialogTitle>
                        <DialogContent>您确定要登出当前账户吗？</DialogContent>
                        <div className={classes.dialogActions}>
                            <Button appearance="primary" onClick={confirmLogout}>
                                确认
                            </Button>
                            <Button appearance="secondary" onClick={() => setIsLogoutDialogOpen(false)}>
                                取消
                            </Button>
                        </div>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
};
