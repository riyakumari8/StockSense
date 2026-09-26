import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Receipts from './pages/Receipts';
import ReceiptForm from './pages/ReceiptForm';
import ReceiptDetails from './pages/ReceiptDetails';
import Deliveries from './pages/Deliveries';
import DeliveryForm from './pages/DeliveryForm';
import DeliveryDetails from './pages/DeliveryDetails';
import Warehouses from './pages/Warehouses';
import Transfers from './pages/Transfers';
import TransferDetails from './pages/TransferDetails';
import Adjustments from './pages/Adjustments';
import AdjustmentDetails from './pages/AdjustmentDetails';
import MoveHistory from './pages/MoveHistory';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <Receipts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts/new"
            element={
              <ProtectedRoute>
                <ReceiptForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts/:id"
            element={
              <ProtectedRoute>
                <ReceiptDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <ProtectedRoute>
                <Deliveries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries/create"
            element={
              <ProtectedRoute>
                <DeliveryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries/new"
            element={
              <ProtectedRoute>
                <DeliveryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries/:id"
            element={
              <ProtectedRoute>
                <DeliveryDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouses"
            element={
              <ProtectedRoute>
                <Warehouses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute>
                <Warehouses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <Transfers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfers/:id"
            element={
              <ProtectedRoute>
                <TransferDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adjustments"
            element={
              <ProtectedRoute>
                <Adjustments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adjustments/:id"
            element={
              <ProtectedRoute>
                <AdjustmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/move-history"
            element={
              <ProtectedRoute>
                <MoveHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
