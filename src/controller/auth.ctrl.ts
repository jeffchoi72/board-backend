import { Context } from 'koa';
import { authService, userService } from '../service';

const signIn = (ctx: Context) => {
  try {
    ctx.sttaus = 200;
    ctx.body = {
      code: 'SUCCESS',
      message: '성공',
      data: null
    };
  } catch (error) {
    ctx.sttaus = 500;
    ctx.body = {
      code: 'SERVER_ERROR',
      message: '[서버에러] 관리자에게 문의해 주섿요',
      data: null
    };
  }
};

const signUp = async (ctx: Context) => {
  try {
    type BodySchema = {
      id: string;
      password: string;
      name: string;
    };

    const signUpValidation = authService.validateSignUp(ctx.request.body);

    if (!signUpValidation) {
      ctx.status = 400;
      ctx.body = {
        code: 'WRONG_SCHEMA',
        message: '요청 파라미터 에러',
        data: null
      };
      return;
    }

    const { id, password, name }: BodySchema = ctx.request.body;

    // 1. 아이디가 이미 있는지 검사한다.
    const userIdExists = await userService.isExistedUserId(id);

    // 2. 중복된 값이 있다면 중복되었다고 에러 처리한다.
    if (userIdExists) {
      ctx.status = 409;
      ctx.body = {
        code: 'DUPLICATED_USER_ID',
        message: '사용자 아이디가 이미 존재합니다',
        data: null
      };
      return;
    }

    // 3. DB user 테이블에 데이터를 등록한다.
    const user = await userService.createUser(id, password, name);
    delete user.password;

    // 4. 토큰을 발행한 후 응답한다.
    const authToken = await authService.getAuthToken(user.id);

    ctx.sttaus = 200;
    ctx.body = {
      code: 'SUCCESS',
      message: '성공',
      data: {
        user,
        token: {
          authToken
        }
      }
    };
  } catch (error) {
    ctx.sttaus = 500;
    ctx.body = {
      code: 'SERVER_ERROR',
      message: '[서버에러] 관리자에게 문의해 주섿요',
      data: null
    };
  }
};

export { signIn, signUp };
