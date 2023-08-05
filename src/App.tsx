import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import SideBar from '@/components/sidebar';

function App() {
	const isLoggedIn = true;
	const renderProtectedRoute = (element: React.ReactElement) => {
		return isLoggedIn ? element : <Navigate to="/login" replace={true} />;
	};
	const denyGoLoginPage = (element: React.ReactElement) => {
		return isLoggedIn ? <Navigate to="/dashboard" replace={true} /> : element;
	};

	return (
		<div className="fts-client" style={{ height: "100%", display: "flex" }}>
			<BrowserRouter>
				{isLoggedIn && <SideBar />}
				<div className="client-content">
					<Routes>
						<Route
							path="/"
							element={<Navigate to="/dashboard" replace={true} />}
						/>
						<Route 
							path="/login" 
							element={denyGoLoginPage(<Login />)} />
						<Route
							path="/dashboard"
							element={renderProtectedRoute(<Dashboard />)}
						/>
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

export default App;
