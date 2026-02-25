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
    useToastController,
} from '@fluentui/react-components';
import { PersonRegular, SignOutRegular } from '@fluentui/react-icons';
import { useState } from 'react';
import { authClient } from './auth/client';
import { MessageToast } from './MessageToast';

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
    const { data: authData, refetch } = authClient.useSession();
    const { user, session } = authData || {};
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const { dispatchToast } = useToastController();

    const openPopup = (tab: 'signin' | 'signup' = 'signin') => {
        const width = 900;
        const height = tab === 'signup' ? 720 : 620;
        const left = Math.round((window.innerWidth - width) / 2);
        const top = Math.round((window.innerHeight - height) / 2);

        const dashboardUrl = new URL('/dashboard', import.meta.env.VITE_BASE_URL);
        dashboardUrl.searchParams.set('callbackURL', import.meta.env.VITE_SITE_URL);
        dashboardUrl.searchParams.set('isPopup', 'true');
        dashboardUrl.searchParams.set('tab', tab);
        const popup = window.open(dashboardUrl, 'authPopup', `width=${width},height=${height},left=${left},top=${top}`);
        if (popup) {
            const handleMessage = (event: MessageEvent) => {
                if (event.origin === import.meta.env.VITE_BASE_URL) {
                    if (event.data === 'sign-in-success') {
                        refetch();
                        dispatchToast(<MessageToast title="登录成功" message="您已成功登录账户" />, {
                            intent: 'success',
                        });
                    } else if (event.data === 'sign-up-success') {
                        dispatchToast(
                            <MessageToast
                                title="注册信息提交成功"
                                message="注册信息提交成功，还需完成邮箱验证方可登录"
                            />,
                            { intent: 'success' },
                        );
                    }
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
            window.open(`${import.meta.env.VITE_BASE_URL}/dashboard`, '_blank');
        }
    };

    const handleLogoutClick = () => {
        setIsLogoutDialogOpen(true);
    };

    const confirmLogout = () => {
        authClient
            .signOut()
            .then(() => {
                dispatchToast(<MessageToast title="登出成功" message="您已成功登出账户" />, {
                    intent: 'success',
                });
                setIsLogoutDialogOpen(false);
            })
            .catch((error) => {
                dispatchToast(<MessageToast title="登出失败" message={error?.message || '登出失败，请重试'} />, {
                    intent: 'error',
                });
            });
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
