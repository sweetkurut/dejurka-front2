import React from "react";
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    HomeOutlined,
    ApartmentOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SunOutlined,
    MoonOutlined,
    // BuildingOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { toggleTheme } from "../../store/slices/themeSlice";
import styles from "./Layout.module.scss";

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { mode } = useSelector((state: RootState) => state.theme);

    console.log("====================================");
    console.log(user);
    console.log("====================================");

    const { token } = theme.useToken();

    // ...
    const getMenuItems = () => {
        const menuItems = [
            {
                key: "/dashboard",
                icon: <HomeOutlined />,
                label: "Дашборд",
            },
            {
                key: "/all-apartments",
                icon: <ApartmentOutlined />,
                label: "Квартиры",
                children: [
                    {
                        key: "/apartments",
                        label: "Все квартиры",
                    },
                    {
                        key: "/apartments/add",
                        label: "Добавить",
                    },
                ],
            },
        ];

        if (user?.role === "admin") {
            menuItems.push(
                {
                    key: "/users",
                    icon: <UserOutlined />,
                    label: "Сотрудники",
                },
                {
                    key: "/directories",
                    icon: <SettingOutlined />,
                    label: "Справочники",
                }
            );
        }

        menuItems.push({
            key: "/profile",
            icon: <UserOutlined />,
            label: "Профиль",
        });

        return menuItems;
    };
    // ...
    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    const userMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Профиль",
            onClick: () => navigate("/profile"),
        },
        {
            type: "divider" as const,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Выйти",
            onClick: handleLogout,
        },
    ];

    return (
        <AntLayout className={styles.layout}>
            <Header className={styles.header}>
                <div className={styles.logo}>Дежурка</div>

                <div className={styles.headerActions}>
                    <Button
                        type="text"
                        icon={mode === "light" ? <MoonOutlined /> : <SunOutlined />}
                        onClick={handleThemeToggle}
                        className={styles.themeToggle}
                    />

                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.fullName}</div>
                    </div>

                    <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                        <div className={styles.userMenu}>
                            <Avatar icon={<UserOutlined />} />
                        </div>
                    </Dropdown>
                </div>
            </Header>

            <AntLayout>
                <Sider width={240} theme={mode} className={styles.sidebar}>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={getMenuItems()}
                        onClick={handleMenuClick}
                        theme={mode}
                    />
                </Sider>

                <Content className={styles.content}>
                    <Outlet />
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default Layout;
