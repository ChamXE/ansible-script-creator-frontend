import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/user/login';
import Register from '@/pages/user/register';
import Profile from '@/pages/user/profile';
import NavBar from '@/components/app/navbar';
import useToken from '@/components/app/useToken';
import SwitchList from '@/pages/device/switch';
import ServerList from '@/pages/device/server';
import HostList from '@/pages/device/host';
import RouterList from '@/pages/device/router';
import ProjectList from '@/pages/project/project';
import BGP from '@/pages/service/bgp';
import CustomIntent from '@/pages/service/customIntent';
import axios from "axios";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';

axios.defaults.withCredentials = true;
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.tz.setDefault('Asia/Kuala_Lumpur');

function App() {
	const { userToken, setUserToken } = useToken();

	const isLoggedIn = !!userToken;

	const renderProtectedRoute = (element: React.ReactElement) => {
		return isLoggedIn ? element : <Navigate to="/login" replace={true} />;
	};
	const denyGoLoginPage = (element: React.ReactElement) => {
		return isLoggedIn ? <Navigate to="/dashboard" replace={true} /> : element;
	};

	return (
		<div style={{ minHeight: "100vh", minWidth: "100vw" }}>
			<BrowserRouter>
				<NavBar setUserToken={setUserToken} isLoggedIn={isLoggedIn} />
				<div className="client-content">
					<Routes>
						<Route
							path="/"
							element={<Navigate to="/dashboard" replace={true} />}
						/>
						<Route
							path="/login"
							element={denyGoLoginPage(<Login setUserToken={setUserToken} />)} />
						<Route
							path="/register"
							element={denyGoLoginPage(<Register />)} />
						<Route
							path="/dashboard"
							element={renderProtectedRoute(<Dashboard />)}
						/>
						<Route
							path="/profile"
							element={renderProtectedRoute(<Profile />)}
						/>
						<Route
							path="/device/server"
							element={renderProtectedRoute(<ServerList />)}
						/>
						<Route
							path="/device/router"
							element={renderProtectedRoute(<RouterList />)}
						/>
						<Route
							path="/device/switch"
							element={renderProtectedRoute(<SwitchList />)}
						/>
						<Route
							path="/device/host"
							element={renderProtectedRoute(<HostList />)}
						/>
						<Route
							path="/project"
							element={renderProtectedRoute(<ProjectList />)}
						/>
						<Route
							path="/service/bgp"
							element={renderProtectedRoute(<BGP />)}
						/>
						<Route
							path="/service/customIntent"
							element={renderProtectedRoute(<CustomIntent />)}
						/>
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

export default App;
