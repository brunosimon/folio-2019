#define M_PI 3.1415926535897932384626433832795

float easeSin(float _value)
{
    return sin((_value - 0.5) * M_PI) * 0.5 + 0.5;
}