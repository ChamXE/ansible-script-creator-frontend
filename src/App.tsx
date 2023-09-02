import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/user/login';
import Register from '@/pages/user/register';
import Profile from '@/pages/user/profile';
import NavBar from '@/components/app/navbar';
import useToken from '@/components/app/useToken'
import Device from '@/pages/device/device';

function App() {
	// TODO => token n login mechanism
	const { userToken, setUserToken } = useToken();

	const isLoggedIn = userToken.token ? true : false;

	const renderProtectedRoute = (element: React.ReactElement) => {
		return isLoggedIn ? element : <Navigate to="/login" replace={true} />;
	};
	const denyGoLoginPage = (element: React.ReactElement) => {
		return isLoggedIn ? <Navigate to="/dashboard" replace={true} /> : element;
	};

	return (
		<div style={{ minHeight: "100vh", minWidth: "100vw" }}>
			<BrowserRouter>
				<NavBar setUserToken={setUserToken} />
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
							path="/server"
							element={renderProtectedRoute(<Device deviceType='server' />)}
						/>
						<Route
							path="/router"
							element={renderProtectedRoute(<Device deviceType='router' />)}
						/>
						<Route
							path="/switch"
							element={renderProtectedRoute(<Device deviceType='switch' />)}
						/>
						<Route
							path="/host"
							element={renderProtectedRoute(<Device deviceType='host' />)}
						/>
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

export default App;
