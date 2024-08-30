import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAssessment } from '../contexts/AssessmentContext';
import { FormData } from '../types/types';

const RegistrationForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  const router = useRouter();
  const { setUserInfo } = useAssessment();

  const onSubmit = async (data: FormData) => {
    setUserInfo({ name: data.name, email: data.email });
    router.push('/instructions');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 rounded-lg shadow-lg max-w-md mx-auto backdrop-blur-sm bg-white/10">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">Name</label>
        <input
          id="name"
          type="text"
          {...register("name", { required: "Name is required" })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white/20 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-300"
          placeholder="Enter your name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
        <input
          id="email"
          type="email"
          {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white/20 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-300"
          placeholder="Enter your email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmEmail" className="block text-sm font-medium text-white">Confirm Email</label>
        <input
          id="confirmEmail"
          type="email"
          {...register("confirmEmail", { 
            required: "Please confirm your email",
            validate: (value) => value === watch('email') || "Emails do not match"
          })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white/20 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-300"
          placeholder="Confirm your email"
        />
        {errors.confirmEmail && <p className="mt-1 text-sm text-red-400">{errors.confirmEmail.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
      >
        Continue
      </button>
    </form>
  );
};

export default RegistrationForm;