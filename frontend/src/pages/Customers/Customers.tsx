// import React, { useState, useEffect } from 'react';
// import { Usuario } from '../../types/auth';
// import { userService } from '../../services/userService';
// import { useAuth } from '../../hooks/useAuth';

// export const Customers: React.FC = () => {
//   const [customers, setCustomers] = useState<Usuario[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     loadCustomers();
//   }, []);

//   const loadCustomers = async () => {
//     try {
//       const data = await userService.getCustomers();
//       setCustomers(data);
//     } catch (error) {
//       console.error('Erro ao carregar clientes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredCustomers = customers.filter(customer =>
//     customer.nome.toLowerCase().includes(search.toLowerCase()) ||
//     customer.email.toLowerCase().includes(search.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">👥 Clientes</h1>
//           <p className="text-gray-600 mt-1">
//             {filteredCustomers.length} de {customers.length} clientes
//           </p>
//         </div>
        
//         <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
//           + Novo Cliente
//         </button>
//       </div>

//       {/* Busca e Filtros */}
//       <div className="bg-white rounded-lg p-6 border border-gray-200">
//         <div className="flex gap-4">
//           <div className="flex-1">
//             <input
//               type="text"
//               placeholder="🔍 Buscar clientes por nome ou email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//           </div>
//           <button
//             onClick={loadCustomers}
//             className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg border border-gray-300 transition-colors"
//           >
//             🔄 Atualizar
//           </button>
//         </div>
//       </div>

//       {/* Lista de Clientes */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
//           {filteredCustomers.map(customer => (
//             <div key={customer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
//                   <span className="text-primary-600 font-bold text-lg">
//                     {customer.nome.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-gray-900">{customer.nome}</h3>
//                   <p className="text-gray-600 text-sm">{customer.email}</p>
//                 </div>
//               </div>

//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Cadastro:</span>
//                   <span className="font-medium">
//                     {new Date(customer.criado_em).toLocaleDateString()}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Status:</span>
//                   <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
//                     Ativo
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
//                 <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
//                   Editar
//                 </button>
//                 <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors">
//                   Histórico
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filteredCustomers.length === 0 && (
//           <div className="text-center py-12">
//             <div className="text-gray-400 text-6xl mb-4">👥</div>
//             <p className="text-gray-500 text-lg">Nenhum cliente encontrado</p>
//             <p className="text-gray-400 mt-1">
//               {search ? 'Tente alterar os termos da busca' : 'Cadastre o primeiro cliente'}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };