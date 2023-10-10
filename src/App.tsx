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
import axios from "axios";

axios.defaults.withCredentials = true;

function App() {
	// TODO => token n login mechanism
	const { userToken, setUserToken } = useToken();

	const isLoggedIn = !!userToken.username.length;

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
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

export default App;
