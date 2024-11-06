#Tạo thư viện random
import random 

#Tiêu đề trò chơi
print("Game đoán số: Hãy nhập số bạn đoán trong khoảng từ 1 đến 100\n")

#Tạo một số ngẫu nhiên
#random_number = random.randint(1,100)
random_number = 21

#Người dùng nhập vào một số
number = int(input("Nhập đáp án của bạn vào đây: "))

#Kiểm tra tính hợp lệ của số được nhập vào
while(number < 1 or number > 100):
    print("Không hợp lệ. Vui lòng nhập số trong khoảng từ 1 đến 100\n")
    number = int(input("Nhập đáp án của bạn vào đây: "))

#Kiểm tra 2 số có giống nhau không
#Lần nhập đầu tiên
if(number == random_number):
    print("\nChính xác! Bạn được 100 điểm.")
else:
    if(number < random_number):
        print("\nSố của bạn nhỏ quá.")
    else:
        print("\nSố của bạn lớn quá.")
    
    #Lần nhập thứ hai
    number = int(input("Nhập lại đáp án của bạn vào đây: "))
    if(number == random_number):
        print("\nChính xác! Bạn được 50 điểm.")
    else:
        if(number < random_number):
            print("\nSố của bạn nhỏ quá.")
        else:
            print("\nSố của bạn lớn quá.")

        #Lần nhập thứ ba
        number = int(input("Nhập lại đáp án của bạn vào đây: "))
        if(number == random_number):
            print("\nChính xác! Bạn được 30 điểm.")
        else:
            print("\nGame over. Đáp án là", random_number)
            

