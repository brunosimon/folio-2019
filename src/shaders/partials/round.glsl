float round(float _value)
{
    float signum = sign(_value);
    float number = abs(_value);
    float number2 = fract(number);
    number = floor(number);
    number2 = ceil((sign(number2 - 0.5) + 1.0) * 0.5);
    number = (number + number2)*signum;
    return number;
}