import AuthLayout from "../Layouts/AuthLayout";
import LoginForm from "../components/AuthForms/LoginForm";
const LoginPage = () => {
  return (
    <>
      <AuthLayout>
        <div className="  translate-x-[200px] motion-preset-slide-right ">
          <LoginForm />
        </div>
        <div className="bg-[url('https://res.cloudinary.com/drinuph9d/image/upload/v1761893464/food_images/food_1761893464021_login.jpg')]  bg-contain bg-no-repeat bg-center md:h-[600px] h-[200px] lg:w-[400px] w-[400px] rounded-xl shadow-2xl shadow-black/50"></div>
      </AuthLayout>
    </>
  );
};

export default LoginPage;
