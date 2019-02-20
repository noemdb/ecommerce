@extends('layouts/main')
@section('content')

    <!-- Checkout Content -->
    <div class="container-fluid no-padding checkout-content" style="margin-top: 40px">
        <!-- Container -->
        <div class="container">
            @if(!Auth::user()->detail->address)
                <div class="alert alert-danger">
                    Por favor <strong>Complete</strong> tu perfíl!
                    <br><a href="/profile/{{auth()->user()->id}}/edit">Edita tu Profíl</a>
                </div>
            @else
                <div class="row">
                    <form action="{{ route('pay') }}" method="POST" class="col-md-12">
                        {{csrf_field()}}
                        <div class="section-padding"></div>

                        <!-- Order Summary -->
                        <!-- Payment Mode -->
                        <div class="col-md-12 payment-mode">
                            <div class="section-title">
                                <h3>INFORMACIÓN DE CONTACTO Y FACTURA...</h3>
                            </div>

                            <div class="section-padding"></div>
                            <div class="container">


                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="name">Nombre</label>
                                            <input type="text" class="form-control" name="name" id="name"
                                                   value="{{Auth::user()->name}}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="surname">Apellido</label>
                                            <input type="text" class="form-control" name="surname" id="surname"
                                                   value="{{Auth::user()->surname}}" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="phone">Teléfono</label>
                                            <input type="text" class="form-control phone" name="phone" id="phone"
                                                   value="{{$user_detail->phone}}">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="m_phone">Mobile Teléfono Movíl</label>
                                            <input type="text" class="form-control m_phone" name="m_phone" id="m_phone"
                                                   value="{{$user_detail->m_phone}}" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="city">Ciudad</label>
                                            <input type="text" class="form-control city" name="city" id="city"
                                                   placeholder="{{$user_detail->city}}" disabled>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="country">País</label>
                                            <input type="text" class="form-control country" name="country" id="country"
                                                   placeholder="{{$user_detail->country}}" required disabled>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="zipcode">Código Postal</label>
                                            <input type="text" class="form-control zipcode" name="zipcode" id="zipcode"
                                                   placeholder="{{$user_detail->zipcode}}" disabled>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="address">Dirección</label>
                                            <input type="text" class="form-control" name="address" id="address"
                                                   value="{{ $user_detail->address }}" required>
                                        </div>
                                    </div>
                                </div>


                            </div>
                            <br><br>
                            <div class="text-center alert alert-info">
                                <h4>PRECIO TOTAL</h4>
                                <span class="price">{{ Cart::total() }}
                                    <small> ₺</small></span>
                            </div>


                            <div class="section-padding"></div>
                        </div>
                        <!-- Order Summary /- -->

                        <!-- Payment Mode -->
                        <div class="container-">
                            <div class="row">
                                <div class="col-md-12">
                                    {!! $getFormContent !!}

                                    <div id="iyzipay-checkout-form" class="responsive"></div>
                                </div>

                                <br><br>

                                <div class="section-padding"></div>
                            </div>
                        </div>

                    </form>
                </div>
            @endif
        </div><!-- Container /- -->
    </div><!-- Checkout Content /- -->
@endsection
