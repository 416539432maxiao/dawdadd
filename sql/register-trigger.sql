-- 创建一个函数来处理新用户注册时的赠送token操作
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    payment_id bigint;
BEGIN
    -- 1. 先在支付历史表中插入一条赠送记录
    INSERT INTO public.nuxtbase_payment_history
        (uid, product_id, product_name, payment_mode, payment_provider, amount, status, out_trade_no, meta)
    VALUES
        (NEW.id, 'FREE_TOKENS', '新用户注册赠送1000token', 'free', 'system', 0, 'success', 'FREE_' || NEW.id, 
        jsonb_build_object('type', 'registration_gift', 'tokens', 1000))
    RETURNING id INTO payment_id;

    -- 2. 在一次性token表中插入赠送的token记录
    INSERT INTO public.nuxtbase_user_onetime_token
        (uid, payment_id, total_tokens, used_tokens)
    VALUES
        (NEW.id, payment_id, 100000, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除已存在的触发器（如果有的话）
DROP TRIGGER IF EXISTS handle_new_user_registration_trigger ON auth.users;

-- 创建触发器
CREATE TRIGGER handle_new_user_registration_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_registration();