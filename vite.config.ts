import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'lucide-icons': ['lucide-react'],

          // Feature chunks
          modals: [
            './src/components/BabyModal.tsx',
            './src/components/ActivityModal.tsx',
            './src/components/ModalForm.tsx',
            './src/components/Modal.tsx',
          ],
          forms: [
            './src/components/BabyForm.tsx',
            './src/components/ActivityForm.tsx',
            './src/components/Input.tsx',
          ],
          hooks: [
            './src/hooks/useForm.ts',
            './src/hooks/useAsyncOperation.ts',
            './src/hooks/useBabyOperations.ts',
            './src/hooks/useActivityOperations.ts',
          ],
        },
      },
    },
    // Increase chunk size warning limit since we're intentionally chunking
    chunkSizeWarningLimit: 600,
  },
})
