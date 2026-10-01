import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAssessment } from '../contexts/AssessmentContext';
import { RegistrationFormValues } from '../types/types';

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const RegistrationForm: React.FC = () => {
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<RegistrationFormValues>();
  const router = useRouter();
  const { setUserInfo } = useAssessment();

  const validateEmail = async (email: string) => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      return "Invalid email format";
    }

    // Check that the domain can actually receive mail.
    const domain = email.trim().split('@')[1];
    try {
      const response = await fetch(`/api/validate-email-domain?domain=${encodeURIComponent(domain)}`);
      const { isValid } = await response.json();
      if (!isValid) {
        return "Invalid email domain";
      }
    } catch (error) {
      console.error("Error validating email domain:", error);
      return "Couldn't verify your email. Please check your connection and try again.";
    }

    return true;
  };

  const onSubmit = (data: RegistrationFormValues) => {
    setUserInfo({ name: data.name.trim(), email: data.email.trim() });
    router.push('/instructions');
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 rounded-lg shadow-lg max-w-md mx-auto backdrop-blur-sm bg-white/10">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">Name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          {...register("name", { validate: (value) => value.trim().length > 0 || "Name is required" })}
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
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            validate: validateEmail
          })}
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
          autoComplete="email"
          {...register("confirmEmail", {
            required: "Please confirm your email",
            validate: (value) => value.trim() === getValues('email').trim() || "Emails do not match"
          })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white/20 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-300"
          placeholder="Confirm your email"
        />
        {errors.confirmEmail && <p className="mt-1 text-sm text-red-400">{errors.confirmEmail.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-60"
      >
        {isSubmitting ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
};

export default RegistrationForm;
